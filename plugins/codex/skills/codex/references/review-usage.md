# codex review 详细用法

## 命令格式

```bash
codex review [options]
```

## 审查模式

### 模式 1：未提交变更

审查当前工作区中已修改但未提交的代码。

```bash
codex review --uncommitted
```

适用场景：
- 提交前的最后检查
- 快速审查当前改动
- 确认没有遗漏的问题

### 模式 2：特定 commit

审查某个具体 commit 引入的变更。

```bash
codex review --commit <sha>
```

示例：
```bash
codex review --commit a1b2c3d
codex review --commit HEAD
codex review --commit HEAD~1
```

适用场景：
- 审查刚刚提交的代码
- 回顾历史 commit 的质量
- 排查某个 commit 引入的问题

### 模式 3：分支对比

对比当前分支与基础分支之间的所有变更。

```bash
codex review --base <base-branch>
```

示例：
```bash
codex review --base main
codex review --base develop
codex review --base origin/main
```

适用场景：
- PR 提交前的完整审查
- 功能分支开发完成后的检查
- 对比 feature 分支与主干的差异

## 审查输出

Codex review 通常会输出：

- **代码质量**：可读性、命名规范、代码结构
- **潜在 bug**：逻辑错误、边界情况、空值处理
- **安全问题**：注入风险、权限问题、敏感信息泄露
- **性能建议**：低效算法、不必要的计算
- **最佳实践**：是否遵循语言/框架的惯例

## 常用工作流

### PR 前审查流程

```bash
# 1. 确认当前分支
git branch

# 2. 审查与 main 的差异
codex review --base main

# 3. 如果有未提交的改动，也一并审查
codex review --uncommitted
```

### 提交后快速检查

```bash
git commit -m "feat: add login"
codex review --commit HEAD
```
