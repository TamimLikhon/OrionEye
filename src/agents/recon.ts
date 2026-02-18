import { BaseAgent } from "./base-agent.js";
import { RECON_SYSTEM_PROMPT } from "../ai/prompts.js";
import { ALL_TOOLS } from "../ai/tools.js";

export class ReconAgent extends BaseAgent {
  constructor(apiKey: string) {
    // Pass tools to the executor
    super(apiKey, RECON_SYSTEM_PROMPT, ALL_TOOLS);
  }

  async run(input: { url: string; repoPath: string }): Promise<any> {
    const prompt = `
    Target URL: ${input.url}
    Repository Path: ${input.repoPath}

    Start your reconnaissance.
    1.  List the files in the repository first.
    2.  Identify the technology stack.
    3.  Find all routes and inputs (use grep_search).
    4.  Verify live endpoints (web_inspect).
    5.  Output the final JSON summary.
    `;

    try {
        const result = await this.executor.execute(prompt);
        
        // Attempt to parse JSON from the result
        const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/{[\s\S]*}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } catch (e) {
                console.warn("Failed to parse JSON from Recon Agent output. Returning raw text.");
            }
        }
        
        return { 
            rawOutput: result,
            status: "Completed (No JSON parsed)"
        };
    } catch (error: any) {
        console.error("Recon Agent Error:", error);
        throw error;
    }
  }
}
