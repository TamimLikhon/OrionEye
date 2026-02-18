import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
  FunctionDeclaration,
  Part,
  Content,
} from "@google/generative-ai";
import chalk from "chalk";

export interface GeminiTool {
  declaration: FunctionDeclaration;
  execute: (args: any) => Promise<any>;
}

export interface ExecutorOptions {
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  maxTurns?: number; // Max conversation turns
}

// Pricing (approximate for Gemini 1.5 Pro)
const COST_PER_1K_INPUT = 0.00035; // $3.50 / 1M
const COST_PER_1K_OUTPUT = 0.00105; // $10.50 / 1M

export class GeminiExecutor {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private session: ChatSession;
  private tools: Map<string, GeminiTool>;
  private totalInputTokens = 0;
  private totalOutputTokens = 0;
  private options: ExecutorOptions;

  constructor(
    apiKey: string,
    systemInstruction: string,
    tools: GeminiTool[] = [],
    options: ExecutorOptions = {}
  ) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.tools = new Map(tools.map((t) => [t.declaration.name, t]));
    this.options = {
      modelName: "gemini-2.5-pro", // User requested specific model
      maxTurns: 100, // Increased limit for complex tasks
      ...options,
    };

    this.model = this.genAI.getGenerativeModel({
      model: this.options.modelName!,
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      },
      tools: tools.length > 0 ? [{ functionDeclarations: tools.map(t => t.declaration) }] : undefined,
      generationConfig: {
        temperature: options.temperature || 0.2, // Lower temp for factual tasks
        maxOutputTokens: options.maxOutputTokens || 8192,
      },
    });

    this.session = this.model.startChat();
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status === 503 || error.message?.includes("Overloaded"))) {
        console.warn(chalk.yellow(`Rate limit/Error hit. Retrying in ${delay}ms... (${retries} left)`));
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async execute(prompt: string): Promise<string> {
    console.log(chalk.blue(`Gemini Request: ${prompt.substring(0, 100).replace(/\n/g, " ")}...`));

    try {
      let result = await this.retryOperation(() => this.session.sendMessage(prompt));
      let response = result.response;
      let text = response.text();
      
      // Update token usage (estimation if not provided in response metadata)
      // Note: usageMetadata is available in newer SDK versions
      if (response.usageMetadata) {
        this.totalInputTokens += response.usageMetadata.promptTokenCount || 0;
        this.totalOutputTokens += response.usageMetadata.candidatesTokenCount || 0;
      }

      let functionCalls = response.functionCalls();
      let turns = 0;

      while (functionCalls && functionCalls.length > 0) {
        turns++;
        if (turns > (this.options.maxTurns || 30)) {
            throw new Error(`Max conversation turns (${this.options.maxTurns}) reached. Potential infinite loop.`);
        }

        const parts: Part[] = [];

        // Parallel execution of independent tools?
        // Gemini sends all calls in one batch. We should execute them all.
        // For safety, let's execute sequentially for now to avoid race conditions on file system.
        
        for (const call of functionCalls) {
          console.log(chalk.yellow(`  -> Tool Call: ${call.name}(${JSON.stringify(call.args)})`));
          
          const tool = this.tools.get(call.name);
          let functionResponse: any = { error: "Tool not found" };

          if (tool) {
            try {
              functionResponse = await tool.execute(call.args);
              // Truncate long responses for logging
              const logRes = JSON.stringify(functionResponse);
              console.log(chalk.green(`    <- Result: ${logRes.length > 200 ? logRes.substring(0, 200) + "..." : logRes}`));
            } catch (error: any) {
              console.error(chalk.red(`    <- Error: ${error.message}`));
              functionResponse = { error: `Error executing tool: ${error.message}` };
            }
          }

          parts.push({
            functionResponse: {
              name: call.name,
              response: { content: functionResponse },
            },
          });
        }

        // Send tool results back
        result = await this.retryOperation(() => this.session.sendMessage(parts));
        response = result.response;
        text = response.text();
        
        if (response.usageMetadata) {
            this.totalInputTokens += response.usageMetadata.promptTokenCount || 0;
            this.totalOutputTokens += response.usageMetadata.candidatesTokenCount || 0;
        }

        functionCalls = response.functionCalls();
      }

      this.logCost();
      return text;

    } catch (error: any) {
      console.error(chalk.red(`Gemini Error: ${error.message}`));
      throw error;
    }
  }

  private logCost() {
    const inputCost = (this.totalInputTokens / 1000) * COST_PER_1K_INPUT;
    const outputCost = (this.totalOutputTokens / 1000) * COST_PER_1K_OUTPUT;
    const total = inputCost + outputCost;
    console.log(chalk.gray(`  [Cost] Tokens: ${this.totalInputTokens} in / ${this.totalOutputTokens} out (~$${total.toFixed(4)})`));
  }
}
