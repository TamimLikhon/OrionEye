import { BaseAgent } from "./base-agent.js";
import { PRE_RECON_SYSTEM_PROMPT } from "../ai/prompts.js";

export class PreReconAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, PRE_RECON_SYSTEM_PROMPT);
  }

  async run(input: { repoPath: string }): Promise<string> {
    const prompt = `
    Repository Path: ${input.repoPath}
    
    Start your Pre-Reconnaissance analysis. 
    Map the repository structure, identify the tech stack, and find high-level sinks in the code.
    Produce the 'code_analysis_deliverable.md' and return its path or a summary.
    `;

    return await this.executor.execute(prompt);
  }
}
