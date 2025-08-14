import {gemini, createAgent,createTool, createNetwork, Tool, type Message, createState } from "@inngest/agent-kit";
import { Sandbox } from '@e2b/code-interpreter';
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { SANDBOX_TIMEOUT } from "./types";

interface AgentState{
  summary: string,
  file: {[path: string]: string}
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent-function" },
  { event: "codeAgentFunction/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("codex-nextjs-test");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run("get-previous-messages", async () => {
      const formattedMessages: Message[] = [];
      const mesages = await prisma.message.findMany({
        where: {
          projectId: event.data.projectId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      for (const message of mesages) {
        formattedMessages.push({
          role: message.role === "ASSISTANT" ? "assistant" : "user",
          content: message.content,
          type: "text"
        });
      }
      return formattedMessages.reverse();
    });

    const state = createState<AgentState>(
      {
        summary: "",
        file: {}
      },
      {
        messages: previousMessages
      }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: `${PROMPT}`,
      model: gemini({
        model: "gemini-2.0-flash",
        // defaultParameters: {
        //   temperature: 0.5,
        // },
        apiKey: process.env.GEMINI_API_KEY,
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            const result = await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  }
                });
                return result.stdout;
              } catch (e) {
                console.error(`Command failed:${e} \n stdout:${buffers.stdout} \n stderror:${buffers.stderr}`)
                return `Command failed: \n stdout:${buffers.stdout} \n stderror:${buffers.stderr}`;
              }
            });
            return result;
          }
        }),

        createTool({
          name: "createOrUpdateFile",
          description: "Create or update a file in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            )
          }),
          handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
            const newFiles = await step?.run("create-or-update-files", async () => {
              try {
                const updatedFiles = await network?.state?.data?.files || {};
                const sandbox = await getSandbox(sandboxId);
                for (const f of files) {
                  await sandbox.files.write(f.path, f.content);
                  updatedFiles[f.path] = f.content;
                }
                return updatedFiles;
              } catch (e) {
                return `Failed to create or update files: ${e}`;
              }
            });

            if (typeof newFiles === "object" && network?.state?.data) {
              network.state.data.files = newFiles;
            }
          }
        }),
     
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string())
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("read-files", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const f of files) {
                  const content = await sandbox.files.read(f);
                  contents.push({ path: f, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          }
        })
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessage = lastAssistantTextMessageContent(result);
          if (lastAssistantTextMessage?.includes("<task_summary>")) {
            if (network?.state?.data) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }
          return result;
        }
      }
    });

    const network = createNetwork<AgentState>({
      name: "codex-coding-agent",
      agents: [codeAgent],
      maxIter: 10,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return; // or return undefined, or handle completion case
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: `${FRAGMENT_TITLE_PROMPT}`,
      model: gemini({
        model: "gemini-2.0-flash"
      })
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: `${RESPONSE_PROMPT}`,
      model: gemini({
        model: "gemini-2.0-flash"
      })
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(result.state.data.summary);
    const { output: responseOutput } = await responseGenerator.run(result.state.data.summary);

    const generateFragmentTitle = () => {
      const output = fragmentTitleOutput[0];
      if (output.type !== 'text')
        return "Fragment"

      else if (Array.isArray(output.content)) {
        return output.content.map(txt => txt).join(" ");
      }

      else
        return  output.content
    };

    const generateResponse = () => {
      const output = responseOutput[0];
      if (output.type !== 'text')
        return "Response"

      else if (Array.isArray(output.content)) {
        return output.content.map(txt => txt).join(" ");
      }

      else
        return  output.content
    };


    const isError = !result.state.data.summary || (Object.keys(result.state.data.files || {}).length === 0);
    if (isError) {
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: "Please try again",
          role: "ASSISTANT",
          type: "RESULT",
        }
      });
    }

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    await step.run("save-result", async () => {
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            }
          }
        }
      })
    });

    return {
      result,
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary
    }
  });