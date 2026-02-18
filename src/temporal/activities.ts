import { Context } from "@temporalio/activity";
import { ReconAgent } from "../agents/recon.js";
import { InjectionAgent } from "../agents/injection.js";
import { ReportAgent } from "../agents/report.js";

// Helper to get API key (in production, use a secure secret store or env)
const getApiKey = () => process.env.GOOGLE_API_KEY || "";

export async function runRecon(url: string, repoPath: string): Promise<any> {
  Context.current().log.info(`Starting Recon on ${url}`);
  
  if (!getApiKey()) {
    throw new Error("GOOGLE_API_KEY is not set.");
  }

  const agent = new ReconAgent(getApiKey());
  const result = await agent.run({ url, repoPath });
  
  return result;
}

export async function runInjectionAnalysis(url: string, repoPath: string, reconResults: any): Promise<any> {
  Context.current().log.info(`Starting Injection Analysis on ${url}`);
  const agent = new InjectionAgent(getApiKey());
  const result = await agent.run({ url, repoPath, reconFindings: reconResults });
  return result;
}

export async function runReport(url: string, reconResults: any, injectionResults: any): Promise<any> {
  Context.current().log.info(`Starting Final Report generation`);
  const agent = new ReportAgent(getApiKey());
  const result = await agent.run({ url, reconResults, injectionResults });
  return result;
}
