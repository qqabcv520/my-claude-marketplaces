---
name: Codex
description: 当用户提到 Codex CLI、想用 codex 分析代码、或需要 codex debug/review 帮助时使用此 skill。提供 Codex CLI 的核心用法、常用参数和最佳实践。触发短语包括："用 codex"、"codex debug"、"codex review"、"让 codex 看看"、"codex 分析"、"codex exec"、"codex 帮我"、"用 codex 检查"、"安装 codex"、"codex 怎么安装"、"codex 没安装"、"codex 配置"、"codex api key"。
version: 1.0.0
---

# Codex CLI 使用指南

## 简介

Codex CLI 是 OpenAI 提供的命令行工具，可以在终端中直接调用 AI 能力进行代码分析、debug 和 review。

安装与配置 → `references/installation.md`

在 Claude Code 中，通过以下方式使用 Codex：
- **自动 debug**：描述 bug 时，`codex-debugger` agent 自动介入
- **手动 review**：运行 `/codex:review` 命令触发代码审查

## 核心命令

### codex exec - 执行任务

非交互式执行任意任务，适合 debug 和代码分析。

```bash
codex exec "<prompt>" --full-auto
```

详细用法 → `references/exec-usage.md`

### codex review - 代码审查

非交互式代码审查，支持三种模式。

```bash
codex review --uncommitted          # 审查未提交变更
codex review --commit <sha>         # 审查特定 commit
codex review --base <branch>        # 对比基础分支
```

详细用法 → `references/review-usage.md`

## 快速选择指南

| 场景 | 使用方式 |
|------|---------|
| 代码报错、bug 分析 | 描述问题，codex-debugger 自动触发 |
| 审查当前改动 | `/codex:review uncommitted` |
| 审查某个 commit | `/codex:review commit <sha>` |
| PR 前代码审查 | `/codex:review branch <feature> --base main` |
| 自定义分析任务 | `codex exec "<描述任务>" --full-auto` |

## 日志与调试

Codex CLI 提供完整的日志和会话管理功能，即使使用 `--final-only` 过滤输出，完整的执行过程仍会被保存。

详细说明 → `references/logging-debug.md`

**快速参考**：

```bash
# 查看实时日志
tail -F ~/.codex/log/codex-tui.log

# 恢复上次会话查看完整执行过程
codex resume --last

# 启用详细日志
RUST_LOG=debug codex exec "<prompt>" --full-auto --final-only
```

## 最佳实践

1. **debug 时提供完整上下文**：错误信息 + 相关代码 + 期望行为
2. **review 前确保代码已保存**：`--uncommitted` 只审查已保存但未提交的变更
3. **分支 review 指定正确的 base**：避免审查范围过大
4. **使用 --final-only 减少输出噪音**：在自动化场景中推荐使用，出问题时可通过日志或 resume 查看详情
