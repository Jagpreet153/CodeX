
import { Agent, openai, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event }) => {
    
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are a expert next js developer. You write readable and maintainable code. You write simple react and node js snippets.",
      model: openai({ model: "gpt-4o-mini", apiKey: process.env.OPEN_AI_API_KEY }),

    });
    const { output } = await summarizer.run(`Write the following snippet : ${event.data.value}`)
    console.log("Summarized output:", output);
     return { output };
  },
);