---
name: kb-search
description: Search the project knowledge base for relevant entries
argument-hint: <search query>
allowed-tools: ["Read", "Grep", "Glob", "Task"]
---

Search the project knowledge base for entries matching the user's query.

## Instructions

1. Read configuration from `.claude/knowledge-base.local.md` to get `kb_path` (default: `~/.claude/knowledge-base/`)
2. If the knowledge base directory doesn't exist, inform the user and suggest running `/kb-add` to create the first entry
3. Search strategy:
   - First check `_index.md` for quick overview
   - Use Grep to search YAML frontmatter (title, tags) and content
   - Match against the user's query keywords
4. Display results:
   - Show matching entry titles, categories, and tags
   - For each match, show a brief summary (first few lines of Content section)
   - Show file paths for reference
5. If no results found, suggest broadening the search or checking available categories

## Usage Examples

```
/kb-search auth          # Search for authentication-related entries
/kb-search websocket 断连  # Search for WebSocket disconnection issues
/kb-search tag:security  # Search by tag
```

Use the kb-researcher agent for complex searches that need context-aware analysis. This command is for quick, direct searches.
