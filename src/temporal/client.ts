import { Connection, Client } from "@temporalio/client";
import { pentestWorkflow } from "./workflows.js";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";

async function run() {
  const connection = await Connection.connect({ 
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233" 
  });
  const client = new Client({ connection });

  // Simple CLI args parsing
  const args = process.argv.slice(2);
  const url = args[0];
  const repo = args[1];

  if (!url || !repo) {
    console.error("Usage: node client.js <url> <repo>");
    process.exit(1);
  }

  const handle = await client.workflow.start(pentestWorkflow, {
    taskQueue: "pentest-queue",
    workflowId: `pentest-${uuidv4()}`,
    args: [url, repo],
  });

  console.log(chalk.green(`Started workflow ${handle.workflowId}`));
  console.log(`View progress at http://localhost:8233/namespaces/default/workflows/${handle.workflowId}`);
  
  // Wait for result
  // const result = await handle.result();
  // console.log(chalk.blue("Workflow Result:"), JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
