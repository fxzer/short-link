import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  buildShortlinks,
  parseShortlinkMarkdown,
  validateShortlinks
} from '../scripts/lib/shortlinks.js'

test('parseShortlinkMarkdown reads frontmatter metadata and body', () => {
  const parsed = parseShortlinkMarkdown(`---
url: https://openai.com
title: OpenAI
description: OpenAI 官方网站
category: AI
tags:
  - model
  - tools
status: active
listed: true
featured: true
---

OpenAI 官网
`)

  assert.deepEqual(parsed, {
    url: 'https://openai.com',
    title: 'OpenAI',
    description: 'OpenAI 官方网站',
    category: 'AI',
    tags: ['model', 'tools'],
    status: 'active',
    listed: true,
    featured: true,
    body: 'OpenAI 官网'
  })
})

test('buildShortlinks generates redirects and public map from markdown files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'link-hao-'))
  await mkdir(join(root, 'links'))

  await writeFile(join(root, 'links', 'openai.md'), `---
url: https://openai.com
title: OpenAI
description: OpenAI 官方网站
category: AI
tags:
  - model
status: active
listed: true
featured: true
---
`)

  await writeFile(join(root, 'links', 'private-demo.md'), `---
url: https://example.com/private
title: Private Demo
status: active
listed: false
---
`)

  await writeFile(join(root, 'links', 'disabled.md'), `---
url: https://example.com/disabled
title: Disabled
status: disabled
listed: true
---
`)

  const result = await buildShortlinks({ rootDir: root, baseUrl: 'https://go.example.com' })

  assert.equal(result.redirectCount, 2)
  assert.equal(result.listedCount, 1)

  const redirects = await readFile(join(root, 'public', '_redirects'), 'utf8')
  assert.equal(redirects, '/openai https://openai.com 302\n/private-demo https://example.com/private 302\n')

  const fallback = await readFile(join(root, 'public', 'private-demo', 'index.html'), 'utf8')
  assert.match(fallback, /Redirecting/)
  assert.match(fallback, /https:\/\/example\.com\/private/)

  const map = JSON.parse(await readFile(join(root, 'public', 'map.json'), 'utf8'))
  assert.deepEqual(map, [
    {
      slug: 'openai',
      shortPath: '/openai',
      shortUrl: 'https://go.example.com/openai',
      url: 'https://openai.com',
      title: 'OpenAI',
      title_en: '',
      description: 'OpenAI 官方网站',
      description_zh: '',
      description_en: '',
      code: '',
      category: 'AI',
      tags: ['model'],
      featured: true
    }
  ])
})

test('validateShortlinks rejects unsafe slugs and target URLs', () => {
  assert.throws(
    () => validateShortlinks([
      { slug: '../secret', url: 'https://example.com', status: 'active', listed: true, sourcePath: 'links/../secret.md' }
    ]),
    /Invalid slug/
  )

  assert.throws(
    () => validateShortlinks([
      { slug: 'bad-url', url: 'javascript:alert(1)', status: 'active', listed: true, sourcePath: 'links/bad-url.md' }
    ]),
    /Invalid URL/
  )
})

test('validateShortlinks rejects redirect sets over the Cloudflare static redirect limit', () => {
  const links = Array.from({ length: 2001 }, (_, index) => ({
    slug: `link-${index}`,
    url: `https://example.com/${index}`,
    status: 'active',
    listed: true,
    sourcePath: `links/link-${index}.md`
  }))

  assert.throws(() => validateShortlinks(links), /Cloudflare Pages static redirect limit/)
})
