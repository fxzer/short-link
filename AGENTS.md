# Agent Instructions

This repository is a Markdown-backed shortlink directory.

## Shortlink Command

When the user starts a request with `/shortlink`, read and follow:

`skills/shortlink-manager/SKILL.md`

Supported commands:

- `/shortlink add <slug> <url> [title]`
- `/shortlink update <slug> <url>`
- `/shortlink hide <slug>`
- `/shortlink show <slug>`
- `/shortlink disable <slug>`
- `/shortlink enable <slug>`
- `/shortlink list`
- `/shortlink build`
- `/shortlink validate`

Natural-language variants are also valid. For example:

- `/shortlink add openai https://openai.com OpenAI`
- `/shortlink hide private-demo from the homepage`
- `/shortlink disable old-campaign`

## Source And Generated Files

Shortlink source files live in:

- `links/*.md`

Do not edit these generated files manually:

- `public/_redirects`
- `public/map.json`
- `public/{slug}/index.html`

Always regenerate generated files with:

```bash
npm run build
```

## Dev Server With Hot Reload

Use `npm run dev` for local development:

- Auto-rebuilds when `links/*.md` or `public/index.html` change
- `live-server` auto-refreshes the browser on file changes
- Serves at `http://127.0.0.1:3456`

No need to run `build` manually while dev server is running.

## Required Checks

After changing `links/*.md`, run:

```bash
npm run build
npm run validate
```

Before claiming completion, run:

```bash
npm test
npm run build
npm run validate
```

## Rules

- Slugs must match `^[a-zA-Z0-9_-]{1,64}$`.
- Target URLs must start with `http://` or `https://`.
- `listed: false` hides a link from the homepage, but does not protect the redirect.
- `status: disabled` removes a link from redirects and the homepage.
- Active redirects must stay within Cloudflare Pages' 2,000 static redirect limit.
