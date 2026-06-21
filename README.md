# link.fxzer.cc.cd

[English](#english) | [中文](#中文)

---

## English

Markdown-backed shortlink directory with a public homepage and Cloudflare Pages static redirects.

### How It Works

`links/*.md` files are the source of truth. The build script scans them and generates:

- `public/_redirects` — Cloudflare Pages static 302 redirects
- `public/map.json` — data consumed by the homepage

### Usage

This project includes a Claude Code skill. Use natural language to manage links directly:

```
添加短链 https://example.com?ref=xxx
删除 example 短链
```

The skill handles file creation, build, test, and validation automatically — no manual steps needed.

### Link Format

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

### Fields

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

### Deploy

Deploy to Cloudflare Pages:

```text
Build command:    npm run build
Output directory: public
```

Cloudflare Pages limits: 2,000 static redirects, 100 dynamic redirects.

### License

[MIT](LICENSE)

---

## 中文

Markdown 驱动的短链接目录，带公开首页和 Cloudflare Pages 静态重定向。

### 工作原理

`links/*.md` 文件是数据源。构建脚本扫描这些文件并生成：

- `public/_redirects` — Cloudflare Pages 静态 302 重定向
- `public/map.json` — 首页使用的数据

### 使用方法

项目内置 Claude Code skill，直接用自然语言管理链接：

```
添加短链 https://example.com?ref=xxx
删除 example 短链
```

Skill 会自动完成文件创建、构建、测试和校验，无需手动操作。

### 链接格式

创建文件如 `links/example.md`：

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

描述内容。
```

文件名即为短链路径：`links/example.md` → `/example`

### 字段说明

| 字段 | 说明 |
|---|---|
| `url` | 目标链接（`http://` 或 `https://`） |
| `title` | 显示标题 |
| `description` | 默认描述 |
| `description_zh` | 中文描述（可选） |
| `description_en` | 英文描述（可选） |
| `code` | 邀请码（可选） |
| `category` | 分类筛选 |
| `tags` | 搜索标签 |
| `status` | `active` 或 `disabled` |
| `listed` | `true` = 显示在首页；`false` = 仅重定向 |
| `featured` | `true` = 精选标记 |

`listed: false` 仅从首页隐藏链接，重定向仍然有效。

### 部署

部署到 Cloudflare Pages：

```text
Build command:    npm run build
Output directory: public
```

Cloudflare Pages 限制：2,000 条静态重定向，100 条动态重定向。

### 许可

[MIT](LICENSE)
