import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities.js";

const { runRecon, runInjectionAnalysis, runReport } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2 hours",
  retry: {
    initialInterval: "5s",
    maximumInterval: "1m",
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export async function pentestWorkflow(url: string, repoPath: string): Promise<any> {
  // Phase 1: Reconnaissance
  const reconResults = await runRecon(url, repoPath);

  // Phase 2: Vulnerability Analysis (Injection)
  const injectionResults = await runInjectionAnalysis(url, repoPath, reconResults);

  // Phase 3: Reporting
  const finalReport = await runReport(url, reconResults, injectionResults);

  return {
    recon: reconResults,
    injection: injectionResults,
    report: finalReport,
    status: "Completed"
  };
}
