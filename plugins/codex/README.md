# Codex Plugin

通过 Codex CLI 为 Claude Code 提供 AI 辅助的代码 debug 和 review 能力。

## 功能

### 自动 Debug（Agent）

当你描述 bug、报错信息或代码异常时，`codex-debugger` agent 自动介入，调用 `codex exec` 进行深度分析。

触发场景：
- "这段代码报错了..."
- "为什么这个函数返回 undefined？"
- "这个 bug 怎么修"
- "代码跑不起来"

### 手动 Code Review（Command）

使用 `/codex:review` 命令手动触发代码审查，支持三种模式：

```bash
/codex:review                                    # 交互式选择模式
/codex:review uncommitted                        # 审查未提交变更
/codex:review commit a1b2c3d                     # 审查特定 commit
/codex:review branch feature/login --base main   # 分支对比审查
```

## 前置要求

需要安装 Codex CLI：

```bash
npm install -g @openai/codex
```

并配置 OpenAI API Key：

```bash
export OPENAI_API_KEY=your-api-key
```

## 组件说明

| 组件 | 文件 | 说明 |
|------|------|------|
| Agent | `agents/codex-debugger.md` | 自动触发 debug |
| Command | `commands/review.md` | 手动触发 review |
| Skill | `skills/codex/SKILL.md` | Codex CLI 知识库 |

## 版本

1.0.0
