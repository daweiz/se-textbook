# /logs 命令

## 功能说明

管理 Claude Code 交互日志系统。通过 `UserPromptSubmit` 和 `Stop` 两个 Hook 自动捕获与 Claude Code 的交互输入与输出信息。

## 日志分类

| 类别 | 触发条件 | 存储位置 |
|------|----------|----------|
| 初创行为 | 提示词起始包含"新建""创建""新增"等关键字 | `.harness/logs/startup/日期.md` |
| 执行命令 | 以 `/xxxx` 命令开始的交互 | `.harness/logs/summary/日期.md` |
| 调教行为 | 提示词起始包含"完善""改进""修改""调教""调整""优化"等关键字 | `.harness/logs/tuning/日期.md` |
| 整改行为 | 调试和整改的提示词及全部输出 | `.harness/logs/action/日期.md` |
| Claude 输出 | Claude Code 返回的结果信息和统计信息 | `.harness/logs/answer/日期.md` |

## 实现原理

- **UserPromptSubmit Hook**: 用户提交提示词时触发，分类保存用户输入到对应的输入日志，同时提取并保存上次的输出信息到输出日志
- **Stop Hook**: 会话停止时触发，保存最后一次会话的输出信息到输出日志

## 技术实现

Hook 脚本（`.claude/hooks/`）为**自包含**的 TypeScript 文件，所有逻辑（分类引擎、JSONL 解析、文件写入）均内联在一个文件中，仅依赖 Node.js 内置模块，无需安装任何 npm 包即可运行。

通过 `/install` 或 `/plugin` 命令可将日志系统部署到其他项目。

## 注意事项

- 仅记录用户输入和 Claude Code 返回的结果信息，不记录系统工作中产生的中间命令和操作
- 详细的交互信息可通过读取 `$HOME/.claude/projects/<项目>/<session-id>.jsonl` 文件获取
