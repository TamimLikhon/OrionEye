import { GeminiExecutor, GeminiTool, ExecutorOptions } from "../ai/gemini-executor.js";
import { ALL_TOOLS } from "../ai/tools.js";
import { RunAgentTool } from "../ai/agent-tool.js";

export abstract class BaseAgent {
  protected executor: GeminiExecutor;

  constructor(
      apiKey: string, 
      systemInstruction: string, 
      tools: GeminiTool[] = [], 
      options: ExecutorOptions = {}
  ) {
    // Default tools if none provided: ALL_TOOLS + RunAgentTool
    const finalTools = tools.length > 0 ? tools : [...ALL_TOOLS, RunAgentTool];

    this.executor = new GeminiExecutor(
      apiKey,
      systemInstruction,
      finalTools,
      { 
          temperature: 0.2, // Lower temp is better for agents
          maxTurns: 30,
          ...options 
      }
    );
  }

  abstract run(input: any): Promise<any>;
}
