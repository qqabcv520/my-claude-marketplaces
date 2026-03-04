---
name: cxreview
description: 使用 Codex CLI 对代码进行审查，支持未提交变更、特定 commit 和分支对比三种模式
argument-hint: "[uncommitted | commit <sha> | branch <feature> [--base <main>]]"
allowed-tools: ["Bash", "AskUserQuestion"]
---

# Codex Code Review

使用 Codex CLI 对代码进行深度审查。

## 执行流程

### Step 1: 确定审查模式

如果用户没有提供参数，使用 AskUserQuestion 询问审查模式：

```
请选择代码审查模式：
1. 未提交变更 - 审查当前工作区的未提交改动
2. 特定 commit - 审查某个具体的 commit
3. 分支对比 - 对比当前分支与基础分支的所有变更
```

### Step 2: 根据模式调用 Codex

**模式 1：未提交变更**
```bash
codex review --uncommitted
```

**模式 2：特定 commit**
```bash
codex review --commit <sha>
```

**模式 3：分支对比**
```bash
codex review --base <base-branch>
```

### Step 3: 展示审查结果

将 Codex 的审查结果完整展示给用户，包括：
- 代码质量问题
- 潜在 bug
- 安全风险
- 改进建议

## 参数解析

当用户提供参数时，直接解析并执行：

- `/codex:review uncommitted` → `codex review --uncommitted`
- `/codex:review commit abc123` → `codex review --commit abc123`
- `/codex:review branch feature/my-feature` → `codex review --base main`（询问 base branch）
- `/codex:review branch feature/my-feature --base develop` → `codex review --base develop`

## 使用示例

```
/codex:review
/codex:review uncommitted
/codex:review commit a1b2c3d
/codex:review branch feature/login --base main
```
