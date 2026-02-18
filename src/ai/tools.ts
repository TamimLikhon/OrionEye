import { GeminiTool } from "./gemini-executor.js";
import { SchemaType } from "@google/generative-ai";
import fs from "fs-extra";
import { exec } from "child_process";
import util from "util";
import path from "path";
import https from "https";
import http from "http";

const execAsync = util.promisify(exec);

// --- File System Tools ---

export const ReadFileTool: GeminiTool = {
  declaration: {
    name: "read_file",
    description: "Reads the content of a file. Use this to analyze code. Truncates if > 100kb.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING, description: "Path to file." },
      },
      required: ["path"],
    },
  },
  execute: async (args: any) => {
    try {
      const stats = await fs.stat(args.path);
      if (stats.size > 100 * 1024) {
          const content = await fs.readFile(args.path, { encoding: "utf-8", flag: "r" }); // Read all for now, maybe stream later
          return { content: content.substring(0, 100000) + "\n...[TRUNCATED]" };
      }
      const content = await fs.readFile(args.path, "utf-8");
      return { content };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

export const WriteFileTool: GeminiTool = {
  declaration: {
    name: "write_file",
    description: "Writes content to a file. Overwrites if exists.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING },
      },
      required: ["path", "content"],
    },
  },
  execute: async (args: any) => {
    try {
      await fs.ensureDir(path.dirname(args.path));
      await fs.writeFile(args.path, args.content);
      return { success: true, message: `File written to ${args.path}` };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

export const ListFilesTool: GeminiTool = {
  declaration: {
    name: "list_files",
    description: "Lists files in a directory.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING },
      },
      required: ["path"],
    },
  },
  execute: async (args: any) => {
    try {
        const files = await fs.readdir(args.path);
        return { files };
    } catch (error: any) {
        return { error: error.message };
    }
  },
};

export const GrepTool: GeminiTool = {
  declaration: {
    name: "grep_search",
    description: "Searches for a string or regex pattern in files recursively. Useful for finding secrets, specific function calls, or vulnerable patterns.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        pattern: { type: SchemaType.STRING, description: "Regex or string to search for." },
        path: { type: SchemaType.STRING, description: "Directory to search in." },
      },
      required: ["pattern", "path"],
    },
  },
  execute: async (args: any) => {
    try {
        // Use native grep with exclusions for speed
        const exclusions = "--exclude-dir={node_modules,.git,dist,build,vendor,coverage} --exclude=package-lock.json --exclude=yarn.lock";
        const command = `grep -rI ${exclusions} "${args.pattern}" "${args.path}" | head -n 50`;
        const { stdout } = await execAsync(command);
        return { matches: stdout || "No matches found." };
    } catch (error: any) {
        return { error: "No matches or error: " + error.message };
    }
  },
};

// --- Network Tools ---

export const WebInspectTool: GeminiTool = {
    declaration: {
        name: "web_inspect",
        description: "Performs an HTTP request (GET/POST) and returns status, headers, and truncated body. Follows redirects.",
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                url: { type: SchemaType.STRING },
                method: { type: SchemaType.STRING, description: "GET, POST, etc." },
                data: { type: SchemaType.STRING, description: "JSON body or form data (optional)." },
            },
            required: ["url"],
        },
    },
    execute: async (args: any) => {
        return new Promise((resolve) => {
            const lib = args.url.startsWith("https") ? https : http;
            const options: any = {
                method: args.method || "GET",
                headers: { "User-Agent": "Shannon-Pentest-Bot/1.0" }
            };

            const req = lib.request(args.url, options, (res) => {
                let data = "";
                res.on("data", (chunk) => {
                    if (data.length < 10000) data += chunk; // Limit body size
                });
                res.on("end", () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data.length >= 10000 ? data + "...[TRUNCATED]" : data
                    });
                });
            });

            req.on("error", (e) => resolve({ error: e.message }));
            
            if (args.data) req.write(args.data);
            req.end();
        });
    }
}

export const RunCommandTool: GeminiTool = {
  declaration: {
    name: "run_command",
    description: "Executes a shell command. Use for nmap, curl (if web_inspect fails), git, etc.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        command: { type: SchemaType.STRING },
      },
      required: ["command"],
    },
  },
  execute: async (args: any) => {
    try {
      console.log(`Executing: ${args.command}`);
      const { stdout, stderr } = await execAsync(args.command);
      return { stdout: stdout.substring(0, 10000), stderr: stderr.substring(0, 5000) };
    } catch (error: any) {
      return {
        stdout: error.stdout?.substring(0, 1000),
        stderr: error.stderr?.substring(0, 1000),
        error: error.message,
      };
    }
  },
};

export const SaveDeliverableTool: GeminiTool = {
  declaration: {
    name: "save_deliverable",
    description: "Saves a formal pentest deliverable (analysis report or exploitation queue). Automatically validates JSON queues.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        deliverable_type: { 
          type: SchemaType.STRING, 
          description: "e.g., INJECTION_ANALYSIS, XSS_QUEUE, REPORT" 
        },
        path: { type: SchemaType.STRING, description: "Desired file path (relative to repo root)." },
        content: { type: SchemaType.STRING, description: "Content string. For queues, MUST be valid JSON." },
      },
      required: ["deliverable_type", "path", "content"],
    },
  },
  execute: async (args: any) => {
    try {
      await fs.ensureDir(path.dirname(args.path));
      
      // Basic JSON validation for queues
      if (args.deliverable_type.endsWith("_QUEUE")) {
        try {
          JSON.parse(args.content);
        } catch (e) {
          return { error: "Deliverable type is a QUEUE but content is not valid JSON." };
        }
      }

      await fs.writeFile(args.path, args.content);
      return { 
        success: true, 
        message: `Deliverable [${args.deliverable_type}] saved to ${args.path}`,
        validated: true 
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};

export const ALL_TOOLS = [
  ReadFileTool, 
  WriteFileTool, 
  ListFilesTool, 
  GrepTool, 
  WebInspectTool, 
  RunCommandTool,
  SaveDeliverableTool
];
