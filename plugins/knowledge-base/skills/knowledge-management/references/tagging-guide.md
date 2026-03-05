# Tagging Guide

## Tag Naming Conventions

- Use lowercase kebab-case: `error-handling`, `api-design`
- Keep tags short (1-3 words): `auth`, `database`, `ci-cd`
- Use singular form: `pattern` not `patterns`
- Avoid overly generic tags: use `jwt-auth` instead of just `code`

## Common Tags by Domain

### Architecture
`architecture`, `microservice`, `monolith`, `api-design`, `event-driven`, `cqrs`

### Backend
`api`, `database`, `cache`, `queue`, `auth`, `middleware`, `orm`

### Frontend
`react`, `vue`, `css`, `responsive`, `accessibility`, `state-management`

### Infrastructure
`docker`, `k8s`, `ci-cd`, `monitoring`, `logging`, `deployment`

### Quality
`testing`, `performance`, `security`, `code-review`, `refactoring`

### Process
`workflow`, `convention`, `tooling`, `documentation`

## Tagging Best Practices

- Assign 2-5 tags per entry for discoverability
- Include at least one domain tag and one topic tag
- Reuse existing tags before creating new ones
- Check `_index.md` for existing tag vocabulary
