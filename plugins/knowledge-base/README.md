# Knowledge Base Plugin

项目知识库管理插件，让 AI 拥有跨会话的"记忆"能力。

## 功能

- **自动提醒查阅**：新任务开始时，Hook 提醒 AI 检查知识库中的相关内容
- **智能总结提醒**：任务完成时，Hook 智能判断是否有值得记录的知识
- **手动操作**：通过命令搜索、添加和管理知识条目
- **SubAgent 检索**：独立子 Agent 检索知识库，不污染主对话上下文

## 组件

| 类型 | 名称 | 说明 |
|------|------|------|
| Skill | knowledge-management | 知识库格式规范和分类体系 |
| Hook | UserPromptSubmit | 新任务时提醒查阅知识库 |
| Hook | Stop | 任务完成时提醒总结知识 |
| Command | `/kb-search` | 搜索知识库 |
| Command | `/kb-add` | 添加知识条目 |
| Command | `/kb-index` | 查看/重建索引 |
| Agent | kb-researcher | 独立检索知识库内容 |

## 知识分类

| 分类 | 用途 |
|------|------|
| `decisions` | 架构决策、技术选型 |
| `solutions` | 技术方案、实现细节 |
| `issues` | Bug 修复、故障排查 |
| `patterns` | 设计模式、代码规范 |
| `corrections` | 错误纠正、认知修正 |
| `context` | 项目背景、业务逻辑 |

## 配置

在项目根目录创建 `.claude/knowledge-base.local.md`：

```yaml
---
kb_path: ~/.claude/knowledge-base
auto_summarize: true
---
```

- `kb_path`：知识库存储路径（默认 `~/.claude/knowledge-base`）
- `auto_summarize`：是否启用自动总结提醒（默认 `true`）

## 快速开始

```bash
# 添加第一个知识条目（会自动创建目录结构）
/kb-add decisions 选择 React 作为前端框架

# 搜索知识库
/kb-search react

# 查看索引
/kb-index

# 重建索引
/kb-index rebuild
```

## 条目格式

```yaml
---
title: "条目标题"
category: decisions
tags: [tag1, tag2]
created: 2026-02-26
updated: 2026-02-26
related: []
---

## Background
...

## Content
...

## Key Takeaways
- ...
```
