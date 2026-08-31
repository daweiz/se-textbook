/**
 * UserPromptSubmit Hook — 自包含完整实现
 *
 * 用户提交提示词时触发，完成以下工作：
 * 1. 分类用户输入并保存到对应的输入日志
 * 2. 从会话 JSONL 中提取上次 Claude 的输出，保存到输出日志
 *
 * 输入分类规则：
 * - 初创行为：提示词起始包含"新建""创建""新增"
 * - 执行命令：以 "/" 开头的命令
 * - 调教行为：提示词起始包含"完善""改进""修改""调教""调整""优化"
 * - 整改行为：其余交互（调试/整改）
 *
 * 本文件可独立运行，无需安装 @itpss/claude-logger 包。
 * 使用方式：npx tsx .claude/hooks/user-prompt-submit.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

// ============================================================
// 类型定义
// ============================================================

interface HookInput {
  session_id?: string;
  prompt?: string;
  message?: string;
  text?: string;
  [key: string]: unknown;
}

interface JsonlMessage {
  type?: string;
  message?: {
    role: "user" | "assistant" | "system";
    content: string | Array<{ type: string; text?: string; [key: string]: unknown }>;
  };
}

type LogCategory = "startup" | "summary" | "tuning" | "action";

const CATEGORY_DIR_MAP: Record<LogCategory, string> = {
  startup: "startup",
  summary: "summary",
  tuning: "tuning",
  action: "action",
};

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

/** 去除 IDE 标签（<ide_opened_file>、<ide_selection> 等），返回用户实际输入 */
function stripIdeTags(text: string): string {
  return text
    .replace(/<ide_opened_file>[\s\S]*?<\/ide_opened_file>/g, "")
    .replace(/<ide_selection>[\s\S]*?<\/ide_selection>/g, "")
    .trim();
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
// 提示词分类
// ============================================================

function classifyPrompt(prompt: string): LogCategory {
  const cleaned = stripIdeTags(prompt);
  const firstLine = cleaned.split("\n")[0].trim();

  if (firstLine.startsWith("/")) {
    return "summary";
  }

  if (/^(新建|创建|新增)/.test(firstLine)) {
    return "startup";
  }

  if (/^(完善|改进|修改|调教|调整|优化)/.test(firstLine)) {
    return "tuning";
  }

  return "action";
}

function categoryDir(baseDir: string, category: LogCategory): string {
  return path.join(baseDir, CATEGORY_DIR_MAP[category]);
}

// ============================================================
// 会话 JSONL 解析
// ============================================================

function extractLastAssistantOutput(jsonlPath: string): string | null {
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
          if (typeof inner.content === "string") {
            return inner.content;
          }
          const texts = inner.content
            .filter((block) => block.type === "text" && block.text)
            .map((block) => block.text!);
          if (texts.length > 0) {
            return texts.join("\n");
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
    // stdin 不可用或格式错误
  }

  const sessionId = input.session_id ?? "";
  const promptText = input.prompt ?? input.message ?? input.text ?? "";

  if (!promptText && !sessionId) return;

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const projectHash = computeProjectHash(projectDir);

  const logsBaseDir = path.join(projectDir, ".harness", "logs");
  const date = today();
  const time = now();

  // ---- 1. 分类并保存用户输入 ----
  if (promptText) {
    const category = classifyPrompt(promptText);
    const dir = categoryDir(logsBaseDir, category);
    const file = path.join(dir, `${date}.md`);
    const entry = `\n---\n**${time}** | 会话: \`${sessionId.slice(0, 8)}...\`\n\n${promptText}\n`;
    appendToFile(file, entry);
  }

  // ---- 2. 提取上次输出并保存到 answer 日志 ----
  if (projectHash && sessionId) {
    const jsonlPath = path.join(
      os.homedir(),
      ".claude",
      "projects",
      projectHash,
      `${sessionId}.jsonl`,
    );
    const lastOutput = extractLastAssistantOutput(jsonlPath);

    if (lastOutput) {
      const answerDir = path.join(logsBaseDir, "answer");
      const answerFile = path.join(answerDir, `${date}.md`);
      const answerEntry = `\n---\n**${time}** | 会话: \`${sessionId.slice(0, 8)}...\`\n\n${lastOutput}\n`;
      appendToFile(answerFile, answerEntry);
    }
  }
}

main().catch(() => {
  // 静默失败，不影响 Claude Code 正常工作
});
