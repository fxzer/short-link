---
name: shortlink-manager
description: Use when the user asks to add, update, hide, disable, list, build, or validate Markdown-backed short links in this repository
---

# Shortlink Manager

This repository treats `links/*.md` as the source of truth for short links. The generated files in `public/` are deployment artifacts.

## Add A Link

1. Extract the slug, target URL, title, description, category, tags, and visibility from the user request.
2. Validate the slug with `^[a-zA-Z0-9_-]{1,64}$`.
3. Validate the target URL starts with `http://` or `https://`.
4. Create `links/{slug}.md` with frontmatter.
5. Run `npm run build`.
6. Run `npm test` and `npm run validate`.
7. Report the short path and changed files.

Use this template:

```md
---
url: https://example.com
title: Example
description: Short human-readable description (fallback)
description_zh: 中文简短描述
description_en: English short description
code: OPTIONAL_INVITE_CODE
category: General
tags:
  - example
status: active
listed: true
featured: false
---

Optional notes.
```

## Update A Link

- Read the existing `links/{slug}.md` first.
- Preserve fields the user did not ask to change.
- Ask before overwriting a slug unless the user explicitly requests an update.
- Rebuild and validate after edits.

## Visibility And Status

- `listed: true` means the link appears on the public homepage.
- `listed: false` means the redirect still exists, but the link is omitted from `public/map.json`.
- `status: active` means the link is included in `public/_redirects`.
- `status: disabled` means the link is excluded from redirects and the homepage.

`listed: false` is not access control. Anyone who knows the slug can still use the redirect while `status: active`.

## Generated Files

Never edit these files manually:

- `public/_redirects`
- `public/map.json`

Always regenerate them with:

```bash
npm run build
```

## Validation Rules

- Slugs may only contain letters, numbers, `_`, and `-`.
- Slugs must be at most 64 characters.
- URLs must use `http://` or `https://`.
- Active redirects must not exceed Cloudflare Pages' 2,000 static redirect limit.
