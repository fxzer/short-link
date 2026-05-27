#!/usr/bin/env node
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const [, , slug, url, ...rest] = process.argv

if (!slug || !url) {
  console.error('Usage: node scripts/add-link.js <slug> <url> [title]')
  process.exit(1)
}

if (!/^[a-zA-Z0-9_-]{1,64}$/.test(slug)) {
  console.error('Invalid slug. Use letters, numbers, dashes, and underscores only.')
  process.exit(1)
}

try {
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
} catch {
  console.error('Invalid URL. Use http:// or https://.')
  process.exit(1)
}

const title = rest.join(' ') || slug
const filePath = join(process.cwd(), 'links', `${slug}.md`)
await mkdir(join(process.cwd(), 'links'), { recursive: true })

try {
  await stat(filePath)
  console.error(`links/${slug}.md already exists. Edit it manually to update.`)
  process.exit(1)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

await writeFile(filePath, `---
url: ${url}
title: ${title}
description:
category:
tags: []
status: active
listed: true
featured: false
---
`, 'utf8')

console.log(`Created links/${slug}.md`)
