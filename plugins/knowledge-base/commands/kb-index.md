---
name: kb-index
description: View or rebuild the knowledge base index
argument-hint: [rebuild]
allowed-tools: ["Read", "Write", "Grep", "Glob"]
---

View the current knowledge base index or rebuild it from all entries.

## Instructions

1. Read configuration from `.claude/knowledge-base.local.md` to get `kb_path` (default: `~/.claude/knowledge-base/`)
2. If the knowledge base directory doesn't exist, inform the user
3. Based on arguments:

### View mode (no arguments or `view`)
- Read and display `_index.md`
- If `_index.md` doesn't exist, suggest running `/kb-index rebuild`
- Show summary: total entries, entries per category, recent additions

### Rebuild mode (`rebuild`)
- Scan all `.md` files in category subdirectories (excluding `_index.md`)
- Read YAML frontmatter from each entry (title, category, tags, created date)
- Generate a new `_index.md` with this format:

```markdown
# Knowledge Base Index

> Auto-generated. Last updated: YYYY-MM-DD

## Summary
- Total entries: N
- Categories: decisions (N), solutions (N), issues (N), patterns (N), corrections (N), context (N)

## decisions (N entries)
- [Entry Title](decisions/filename.md) — tags: tag1, tag2 — created: YYYY-MM-DD

## solutions (N entries)
...
```

- Sort entries within each category by date (newest first)
- Report what changed (new entries found, removed entries, etc.)

## Usage Examples

```
/kb-index           # View current index
/kb-index rebuild   # Rebuild index from all entries
```
