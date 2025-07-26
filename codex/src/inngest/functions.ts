
import { Agent, openai, createAgent } from "@inngest/agent-kit";
import { Sandbox } from '@e2b/code-interpreter';
import { inngest } from "./client";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("codex-nextjs-test");
      return sandbox.sandboxId;
    });
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are a expert next js developer. You write readable and maintainable code. You write simple react and node js snippets.",
      model: openai({ model: "gpt-4o-mini", apiKey: process.env.OPEN_AI_API_KEY }),

    });

    const { output } = await summarizer.run(`Write the following snippet : ${event.data.value}`)
    console.log("Summarized output:", output);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `http://${host}`;
    });


    return { output,sandboxUrl }; 
  },
);