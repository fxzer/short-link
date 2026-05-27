# link.79px.com

Markdown-backed shortlink directory with a public homepage and Cloudflare Pages static redirects.

Markdown 驱动的短链接目录，带公开首页和 Cloudflare Pages 静态重定向。

## How It Works / 工作原理

`links/*.md` files are the source of truth. The build script scans them and generates:

- `public/_redirects` — Cloudflare Pages static 302 redirects
- `public/map.json` — data consumed by the homepage

`links/*.md` 文件是数据源。构建脚本扫描这些文件并生成：

- `public/_redirects` — Cloudflare Pages 静态 302 重定向
- `public/map.json` — 首页使用的数据

## Link Format / 链接格式

Create a file such as `links/example.md`:

```md
---
url: https://example.com
title: Example
description: Example service
description_zh: 示例服务
description_en: Example service
code: INVITE123
category: Tools
tags:
  - tools
status: active
listed: true
featured: false
---

Description here.
```

The filename becomes the slug: `links/example.md` → `/example`

文件名即为短链路径：`links/example.md` → `/example`

## Fields / 字段

| Field | Description |
|---|---|
| `url` | Target URL (`http://` or `https://`) |
| `title` | Display title |
| `description` | Default description |
| `description_zh` | Chinese description (optional) |
| `description_en` | English description (optional) |
| `code` | Invite code (optional) |
| `category` | Filter category |
| `tags` | Search tags |
| `status` | `active` or `disabled` |
| `listed` | `true` = show on homepage; `false` = redirect only |
| `featured` | `true` = featured badge |

`listed: false` hides the link from the homepage but does not protect the redirect.

`listed: false` 仅从首页隐藏链接，重定向仍然有效。

## Commands / 命令

```bash
npm test          # Run tests / 运行测试
npm run build     # Generate _redirects + map.json / 生成 _redirects 和 map.json
npm run validate  # Validate shortlinks / 验证短链接
```

## Deploy / 部署

Deploy to Cloudflare Pages:

```text
Build command:    npm run build
Output directory: public
```

Cloudflare Pages limits: 2,000 static redirects, 100 dynamic redirects.

## License / 许可

[MIT](LICENSE)
