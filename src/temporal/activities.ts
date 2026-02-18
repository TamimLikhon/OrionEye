import { Context } from "@temporalio/activity";
import { PreReconAgent } from "../agents/pre-recon.js";
import { ReconAgent } from "../agents/recon.js";
import { VulnerabilityAgent, VulnType } from "../agents/vulnerability.js";
import { ExploitationAgent } from "../agents/exploitation.js";
import { ReportAgent } from "../agents/report.js";
import * as fs from 'fs/promises';
import * as path from 'path';

// Helper to get API key
const getApiKey = () => process.env.GOOGLE_API_KEY || "";

export async function runPreRecon(repoPath: string): Promise<string> {
  Context.current().log.info(`Starting Pre-Recon on ${repoPath}`);
  const agent = new PreReconAgent(getApiKey());
  return await agent.run({ repoPath });
}

export async function runRecon(url: string, repoPath: string): Promise<any> {
  Context.current().log.info(`Starting Recon on ${url}`);
  const agent = new ReconAgent(getApiKey());
  return await agent.run({ url, repoPath });
}

export async function runVulnerabilityAnalysis(
  type: VulnType, 
  url: string, 
  repoPath: string, 
  reconResults: any, 
  codeAnalysis?: string
): Promise<any> {
  Context.current().log.info(`Starting ${type.toUpperCase()} Vulnerability Analysis`);
  const agent = new VulnerabilityAgent(getApiKey(), type);
  return await agent.run({ url, repoPath, reconFindings: reconResults, codeAnalysis });
}

export async function runExploitation(
  type: VulnType, 
  url: string, 
  repoPath: string, 
  exploitationQueue: any
): Promise<any> {
  Context.current().log.info(`Starting ${type.toUpperCase()} Exploitation`);
  const agent = new ExploitationAgent(getApiKey(), type);
  return await agent.run({ url, repoPath, exploitationQueue });
}

export async function readExploitationQueue(repoPath: string, type: VulnType): Promise<any> {
  const queuePath = path.join(repoPath, 'deliverables', `${type}_exploitation_queue.json`);
  try {
    const data = await fs.readFile(queuePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    Context.current().log.warn(`Could not read exploitation queue for ${type}: ${error}`);
    return { vulnerabilities: [] };
  }
}

export async function runReport(url: string, reconResults: any, allResults: any): Promise<any> {
  Context.current().log.info(`Starting Final Report generation`);
  const agent = new ReportAgent(getApiKey());
  return await agent.run({ url, reconResults, allResults });
}
