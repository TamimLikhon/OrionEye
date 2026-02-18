import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities.js";
import { VulnType } from "../agents/vulnerability.js";

const { 
  runPreRecon, 
  runRecon, 
  runVulnerabilityAnalysis, 
  runReadExploitationQueue, // Note: I used runReadExploitationQueue in my mind but named it readExploitationQueue in activities. Fixed below.
  runExploitation, 
  runReport 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 hours",
  retry: {
    initialInterval: "5s",
    maximumInterval: "1m",
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

// Re-importing with correct names matching activities.ts
const act = proxyActivities<typeof activities>({
    startToCloseTimeout: "2 hours",
});

export async function pentestWorkflow(url: string, repoPath: string): Promise<any> {
  const vulnTypes: VulnType[] = ['injection', 'xss', 'auth', 'authz', 'ssrf'];

  // Phase 1: Pre-Reconnaissance (Source Code Analysis)
  const codeAnalysis = await act.runPreRecon(repoPath);

  // Phase 2: Reconnaissance (Attack Surface Mapping)
  const reconResults = await act.runRecon(url, repoPath);

  // Phase 3: Vulnerability Analysis (Parallel)
  const vulnPromises = vulnTypes.map(type => 
    act.runVulnerabilityAnalysis(type, url, repoPath, reconResults, codeAnalysis)
  );
  const vulnResults = await Promise.all(vulnPromises);

  // Phase 4: Exploitation (Sequential for now to avoid session conflicts)
  const exploitationResults = [];
  for (const type of vulnTypes) {
    const queue = await act.readExploitationQueue(repoPath, type);
    if (queue && queue.vulnerabilities && queue.vulnerabilities.length > 0) {
      const result = await act.runExploitation(type, url, repoPath, queue);
      exploitationResults.push(result);
    }
  }

  // Phase 5: Reporting
  const finalReport = await act.runReport(url, reconResults, {
    vulnResults,
    exploitationResults
  });

  return {
    status: "Completed",
    codeAnalysis,
    recon: reconResults,
    vulnerabilities: vulnResults,
    exploits: exploitationResults,
    report: finalReport
  };
}
