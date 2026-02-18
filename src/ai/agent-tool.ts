import { GeminiTool, GeminiExecutor } from "./gemini-executor.js";
import { SchemaType } from "@google/generative-ai";
import { ALL_TOOLS } from "./tools.js";

export const RunAgentTool: GeminiTool = {
  declaration: {
    name: "run_agent",
    description: "Launches a specialized sub-agent to perform a specific task in isolation. Use this for complex code analysis, deep file exploration, or when you need a fresh context to avoid cluttering your main memory. The sub-agent has access to the same file system and tools.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        role: {
          type: SchemaType.STRING,
          description: "The role/persona of the sub-agent (e.g., 'Code Analyst', 'SQL Injection Expert').",
        },
        task: {
          type: SchemaType.STRING,
          description: "The specific task description and instructions for the sub-agent.",
        },
        context: {
          type: SchemaType.STRING,
          description: "Any necessary context from your current session (e.g., file paths, previous findings).",
        },
      },
      required: ["role", "task"],
    },
  },
  execute: async (args: any) => {
    try {
      const apiKey = process.env.GOOGLE_API_KEY || "";
      if (!apiKey) {
        return { error: "GOOGLE_API_KEY not found in environment." };
      }

      const systemPrompt = `You are a specialized sub-agent with the role: ${args.role}.
      Your task is: ${args.task}
      
      Context provided by the main agent:
      ${args.context || "No context provided."}
      
      You have access to file system and shell tools. Use them to complete your task.
      Return a concise summary of your findings.`;

      // Create a new executor for this sub-agent
      // Crucial: We pass ALL_TOOLS (except RunAgentTool to prevent infinite recursion depth? 
      // Actually, infinite recursion is bad, but 1-level deep is fine. Let's allow recursion for now or limit it.)
      // For simplicity, we give the sub-agent the standard file/shell tools but NOT the ability to spawn more agents to prevent runaway costs.
      
      const executor = new GeminiExecutor(
        apiKey,
        systemPrompt,
        ALL_TOOLS, // Only base tools, no recursion
        { temperature: 0.5 }
      );

      const result = await executor.execute("Start your task.");
      return { agent_output: result };

    } catch (error: any) {
      return { error: `Sub-agent failed: ${error.message}` };
    }
  },
};
