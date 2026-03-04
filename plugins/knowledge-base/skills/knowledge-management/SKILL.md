---
name: Knowledge Management
description: This skill should be used when the user asks to "管理知识库", "添加知识条目", "查阅知识库", "搜索知识", "总结到知识库", "知识库格式", "创建知识条目", "add knowledge entry", "search knowledge base", "knowledge base structure", "organize knowledge entries", "update knowledge index", or mentions knowledge base operations, knowledge entry formatting, or knowledge categorization. Provides knowledge base structure, entry format standards, and categorization guidance.
version: 0.1.0
---

# Knowledge Management

## Overview

Provide structured knowledge management for projects. Knowledge entries use YAML frontmatter for metadata and Markdown for content, organized by category with an auto-generated index.

## Knowledge Base Structure

Knowledge entries are stored in a configurable directory (default: `~/.claude/knowledge-base/`), organized by category:

```
{kb_path}/
├── _index.md              # Auto-generated directory index
├── decisions/             # Architecture decisions, tech choices, design trade-offs
├── solutions/             # Technical solutions, implementation details, API design
├── issues/                # Bug fixes, troubleshooting, workarounds
├── patterns/              # Design patterns, code conventions, best practices
├── corrections/           # Error corrections, misconception clarifications
└── context/               # Background context, business logic, project history
```

## Entry Format

Every knowledge entry follows this YAML + Markdown format:

```yaml
---
title: "Entry title"
category: decisions | solutions | issues | patterns | corrections | context
tags: [relevant, searchable, tags]
created: YYYY-MM-DD
updated: YYYY-MM-DD
related: [other-entry-filename]
---

## Background
Why this knowledge exists, what prompted it.

## Content
The core knowledge, details, and explanation.

## Key Takeaways
- Bullet points summarizing the most important points
```

## Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `decisions` | Architecture and design choices | Tech stack selection, API design decisions |
| `solutions` | Implementation approaches | Authentication flow, caching strategy |
| `issues` | Problem resolution records | Bug fixes, performance issues, workarounds |
| `patterns` | Reusable code patterns | Error handling patterns, testing conventions |
| `corrections` | Misconception fixes | Corrected assumptions, updated understanding |
| `context` | Project background | Business rules, domain knowledge, team conventions |

## Configuration

Read user configuration from `.claude/knowledge-base.local.md`:

```yaml
---
kb_path: ~/.claude/knowledge-base
auto_summarize: true
---
```

Default `kb_path` is `~/.claude/knowledge-base` if no configuration file exists.

## Index Generation

The `_index.md` file provides a navigable directory of all entries. Format:

```markdown
# Knowledge Base Index

> Auto-generated. Last updated: YYYY-MM-DD

## decisions (N entries)
- [Entry Title](decisions/filename.md) — tags: tag1, tag2

## solutions (N entries)
- [Entry Title](solutions/filename.md) — tags: tag1, tag2
...
```

Regenerate the index whenever entries are added, updated, or removed.

## Workflow Integration

### When receiving a new task
1. Check if knowledge base exists at configured path
2. Search for entries related to the current task by tags and titles
3. Load relevant entries to inform the approach

### When completing work
1. Identify new knowledge worth preserving (decisions made, problems solved, patterns discovered)
2. Create entries in the appropriate category
3. Update the index

## File Naming Convention

Use kebab-case with date prefix: `YYYY-MM-DD-descriptive-name.md`

Example: `2026-02-26-auth-jwt-vs-session.md`

## Additional Resources

### Reference Files

For detailed guidance, consult:
- **`references/entry-templates.md`** — Templates for each category type
- **`references/tagging-guide.md`** — Tag naming conventions and common tags

### Example Files

Working examples in `examples/`:
- **`examples/decision-entry.md`** — Complete decision record example
- **`examples/issue-entry.md`** — Complete issue resolution example
