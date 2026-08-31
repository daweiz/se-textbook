/**
 * Stop Hook — 自包含完整实现
 *
 * 会话停止时触发，保存最后一次 Claude Code 的输出信息到输出日志。
 * 输出信息采集内容包括：完成报告、统计信息（Token 用量等）。
 *
 * 本文件可独立运行，无需安装 @itpss/claude-logger 包。
 * 使用方式：npx tsx .claude/hooks/stop.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

// ============================================================
// 类型定义
// ============================================================

interface HookInput {
  session_id?: string;
  stop_reason?: string;
  [key: string]: unknown;
}

interface JsonlMessage {
  type?: string;
  message?: {
    role: "user" | "assistant" | "system";
    content: string | Array<{ type: string; text?: string; [key: string]: unknown }>;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cache_read_input_tokens?: number;
      cache_creation_input_tokens?: number;
    };
  };
}

// ============================================================
// 工具函数
// ============================================================

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

function now(): string {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function appendToFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, "utf-8");
}

/** 从项目目录计算 hash（路径格式: X:\path\to\project → x--path-to-project） */
function computeProjectHash(projectDir: string): string | null {
  const resolved = path.resolve(projectDir);
  const drive = resolved.charAt(0).toLowerCase();
  const rest = resolved.slice(3).replace(/\\/g, "-");
  const hash = `${drive}--${rest}`;

  const hashDir = path.join(os.homedir(), ".claude", "projects", hash);
  if (fs.existsSync(hashDir) && fs.statSync(hashDir).isDirectory()) {
    return hash;
  }
  return null;
}

// ============================================================
// 会话 JSONL 解析
// ============================================================

function extractLastAssistantWithUsage(jsonlPath: string): {
  content: string;
  usage: string;
} | null {
  if (!fs.existsSync(jsonlPath)) return null;

  try {
    const lines = fs.readFileSync(jsonlPath, "utf-8").trim().split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        const msg: JsonlMessage = JSON.parse(line);
        const inner = msg.message;
        if (inner && inner.role === "assistant" && inner.content) {
          let content = "";
          if (typeof inner.content === "string") {
            content = inner.content;
          } else {
            content = inner.content
              .filter((block) => block.type === "text" && block.text)
              .map((block) => block.text!)
              .join("\n");
          }

          let usage = "";
          if (inner.usage) {
            const parts: string[] = [];
            if (inner.usage.input_tokens !== undefined) {
              parts.push(`输入 Token: ${inner.usage.input_tokens}`);
            }
            if (inner.usage.output_tokens !== undefined) {
              parts.push(`输出 Token: ${inner.usage.output_tokens}`);
            }
            if (inner.usage.cache_read_input_tokens) {
              parts.push(`缓存读取: ${inner.usage.cache_read_input_tokens}`);
            }
            usage = parts.join(" | ");
          }

          if (content) {
            return { content, usage };
          }
        }
      } catch {
        // 跳过无法解析的行
      }
    }
  } catch {
    // 读取失败
  }
  return null;
}

// ============================================================
// stdin 读取
// ============================================================

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }

    const chunks: Buffer[] = [];
    process.stdin.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    process.stdin.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    process.stdin.on("error", () => {
      resolve("");
    });

    setTimeout(() => resolve(""), 3000);
  });
}

// ============================================================
// 主流程
// ============================================================

async function main(): Promise<void> {
  // 读取 hook 输入
  let input: HookInput = {};
  try {
    const stdinData = await readStdin();
    if (stdinData) {
      input = JSON.parse(stdinData);
    }
  } catch {
    // stdin 不可用
  }

  const sessionId = input.session_id ?? "";

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const projectHash = computeProjectHash(projectDir);

  if (!projectHash || !sessionId) return;

  // 读取会话 JSONL，提取最后一条 assistant 输出
  const jsonlPath = path.join(
    os.homedir(),
    ".claude",
    "projects",
    projectHash,
    `${sessionId}.jsonl`,
  );
  const result = extractLastAssistantWithUsage(jsonlPath);

  if (!result) return;

  // 写入输出日志
  const logsBaseDir = path.join(projectDir, ".harness", "logs");
  const answerDir = path.join(logsBaseDir, "answer");
  const answerFile = path.join(answerDir, `${today()}.md`);
  const time = now();

  let entry = `\n---\n**${time}** | 会话结束 | \`${sessionId.slice(0, 8)}...\`\n`;

  if (result.usage) {
    entry += `\n📊 统计: ${result.usage}\n`;
  }

  entry += `\n${result.content}\n`;
  appendToFile(answerFile, entry);
}

main().catch(() => {
  // 静默失败，不影响 Claude Code 正常工作
});
