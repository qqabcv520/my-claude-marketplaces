---
name: kb-add
description: Add a new entry to the project knowledge base
argument-hint: [category] <title>
allowed-tools: ["Read", "Write", "Grep", "Glob"]
---

Create a new knowledge base entry with proper formatting and categorization.

## Instructions

1. Read configuration from `.claude/knowledge-base.local.md` to get `kb_path` (default: `~/.claude/knowledge-base/`)
2. If the knowledge base directory doesn't exist, create it with all category subdirectories:
   - `decisions/`, `solutions/`, `issues/`, `patterns/`, `corrections/`, `context/`
3. Parse the user's input:
   - If category is provided (e.g., `/kb-add decisions JWT选型`), use it directly
   - If only a title is given, ask the user to choose a category
   - If no arguments, ask what knowledge to record
4. Create the entry file:
   - Filename: `YYYY-MM-DD-kebab-case-title.md` (today's date)
   - Location: `{kb_path}/{category}/`
   - Use the YAML + Markdown format from the knowledge-management skill
   - Fill in frontmatter: title, category, tags, created date
   - Write the Background, Content, and Key Takeaways sections based on conversation context
5. After creating the entry, update `_index.md`:
   - If `_index.md` doesn't exist, create it
   - Add the new entry to the appropriate category section
   - Sort entries by date within each category

## Category Reference

| Category | Use When |
|----------|----------|
| `decisions` | Recording architecture or design choices |
| `solutions` | Documenting a technical approach |
| `issues` | Recording a bug fix or troubleshooting |
| `patterns` | Capturing a reusable code pattern |
| `corrections` | Fixing a previous misconception |
| `context` | Adding project background info |

## Usage Examples

```
/kb-add decisions 选择 PostgreSQL 作为主数据库
/kb-add issues 修复登录页面白屏问题
/kb-add                                    # Interactive mode
```
