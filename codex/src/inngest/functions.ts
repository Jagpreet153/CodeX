import {gemini, createAgent,createTool, createNetwork } from "@inngest/agent-kit";
import { Sandbox } from '@e2b/code-interpreter';
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("codex-nextjs-test");
      return sandbox.sandboxId;
    });
    
    const codeAgent = createAgent({
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
          handler: async ({ files }, { step, network }) => {
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

    const network = createNetwork({
      name: "codex-coding-agent",
      agents: [codeAgent],
      maxIter: 10,
      router: async ({ network }) => {
        const summary = network.state.data?.summary;
        if (summary) {
          return ; // or return undefined, or handle completion case
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });

    return {
      result,
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary
    }; 
  },
);