import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "./activities.js";
import chalk from "chalk";
import { URL } from "url";

async function run() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: new URL("./workflows.js", import.meta.url).pathname,
    activities,
    taskQueue: "pentest-queue",
  });

  console.log(chalk.green(`Worker started. Connected to ${process.env.TEMPORAL_ADDRESS || "localhost:7233"}. Listening on 'pentest-queue'`));
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
