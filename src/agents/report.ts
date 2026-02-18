import { BaseAgent } from "./base-agent.js";
import { REPORT_SYSTEM_PROMPT } from "../ai/prompts.js";
import { ALL_TOOLS } from "../ai/tools.js";

export class ReportAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, REPORT_SYSTEM_PROMPT, ALL_TOOLS);
  }

  async run(input: { url: string; reconResults: any; injectionResults: any }): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = `/app/audit-logs/report-${timestamp}.md`;

    const prompt = `
    Generate the Final Penetration Test Report for ${input.url}.

    Findings:
    - Reconnaissance: ${JSON.stringify(input.reconResults)}
    - Injection Analysis: ${JSON.stringify(input.injectionResults)}

    1. Synthesize all findings into a professional Markdown report.
    2. Include Executive Summary, Technical Details, and Remediation.
    3. Save the report to: ${reportPath} using the 'write_file' tool.
    4. Return the path of the saved report.
    `;

    try {
        const result = await this.executor.execute(prompt);
        return {
            agent: "ReportAgent",
            output: result,
            reportPath: reportPath
        };
    } catch (error: any) {
        console.error("Report Agent Error:", error);
        throw error;
    }
  }
}
