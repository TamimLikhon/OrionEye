import { BaseAgent } from "./base-agent.js";
import { REPORT_SYSTEM_PROMPT } from "../ai/prompts.js";

export class ReportAgent extends BaseAgent {
  constructor(apiKey: string) {
    super(apiKey, REPORT_SYSTEM_PROMPT);
  }

  async run(input: { url: string; reconResults: any; allResults: any }): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = `deliverables/comprehensive_security_assessment_report.md`;

    const prompt = `
    Generate the Final Penetration Test Report for ${input.url}.

    Data Source:
    - Reconnaissance: ${JSON.stringify(input.reconResults)}
    - Vulnerability & Exploitation Results: ${JSON.stringify(input.allResults)}

    Guidelines:
    1. Consolidate ALL verified (exploited) findings.
    2. Reference specific code files and lines.
    3. Include Proof-of-Concept payloads.
    4. Provide actionable remediation steps.
    5. Save the final report to: ${reportPath} using the 'write_file' tool.
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
