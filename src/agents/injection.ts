import { BaseAgent } from "./base-agent.js";
import { INJECTION_SYSTEM_PROMPT } from "../ai/prompts.js";
import { ALL_TOOLS } from "../ai/tools.js";

export class InjectionAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, INJECTION_SYSTEM_PROMPT, ALL_TOOLS);
  }

  async run(input: { url: string; repoPath: string; reconFindings: any }): Promise<any> {
    const findingsStr = JSON.stringify(input.reconFindings, null, 2);
    
    const prompt = `
    Target URL: ${input.url}
    Repository Path: ${input.repoPath}
    
    Reconnaissance Findings:
    ${findingsStr}

    Start your Injection Analysis.
    1.  Focus on the 'routes' identified in the Recon findings, especially those with inputs.
    2.  For each route, check the source code for sinks (SQL, eval, system calls).
    3.  Generate specific payloads for the inputs found.
    4.  Test them against the live URL.
    5.  Report CONFIRMED vulnerabilities in JSON format.
    `;

    try {
        const result = await this.executor.execute(prompt);
        
        const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/{[\s\S]*}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } catch (e) {
                console.warn("Failed to parse JSON from Injection Agent. Returning raw text.");
            }
        }
        
        return { 
            rawOutput: result,
            status: "Completed (No JSON parsed)"
        };
    } catch (error: any) {
        console.error("Injection Agent Error:", error);
        throw error;
    }
  }
}
