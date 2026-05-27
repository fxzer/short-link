import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'

const SLUG_RE = /^[a-zA-Z0-9_-]{1,64}$/
const STATIC_REDIRECT_LIMIT = 2000

export function parseShortlinkMarkdown(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) {
    return { body: markdown.trim() }
  }

  return {
    ...parseFrontmatter(match[1]),
    body: match[2].trim()
  }
}

export async function loadShortlinks({ rootDir = process.cwd(), linksDir = 'links' } = {}) {
  const dir = join(rootDir, linksDir)
  const entries = await readdir(dir, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return []
    throw error
  })

  const links = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue

    const sourcePath = join(dir, entry.name)
    const metadata = parseShortlinkMarkdown(await readFile(sourcePath, 'utf8'))
    links.push({
      slug: basename(entry.name, '.md'),
      sourcePath: relative(rootDir, sourcePath),
      url: metadata.url,
      title: metadata.title || basename(entry.name, '.md'),
      description: metadata.description || '',
      description_zh: metadata.description_zh || '',
      description_en: metadata.description_en || '',
      code: metadata.code || '',
      category: metadata.category || '',
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      status: metadata.status || 'active',
      listed: metadata.listed !== false,
      featured: metadata.featured === true
    })
  }

  return links.sort((a, b) => a.slug.localeCompare(b.slug))
}

export function validateShortlinks(links) {
  const seen = new Set()
  const activeLinks = []

  for (const link of links) {
    if (!SLUG_RE.test(link.slug)) {
      throw new Error(`Invalid slug "${link.slug}" in ${link.sourcePath}. Use ${SLUG_RE}.`)
    }

    if (seen.has(link.slug)) {
      throw new Error(`Duplicate slug "${link.slug}".`)
    }
    seen.add(link.slug)

    if (!['active', 'disabled'].includes(link.status)) {
      throw new Error(`Invalid status "${link.status}" in ${link.sourcePath}. Use active or disabled.`)
    }

    if (link.status !== 'active') continue

    if (!isHttpUrl(link.url)) {
      throw new Error(`Invalid URL for "${link.slug}" in ${link.sourcePath}. Use http:// or https://.`)
    }
    activeLinks.push(link)
  }

  if (activeLinks.length > STATIC_REDIRECT_LIMIT) {
    throw new Error(
      `Cloudflare Pages static redirect limit exceeded: ${activeLinks.length}/${STATIC_REDIRECT_LIMIT}.`
    )
  }

  return {
    totalCount: links.length,
    redirectCount: activeLinks.length,
    listedCount: activeLinks.filter(link => link.listed).length
  }
}

export async function buildShortlinks({
  rootDir = process.cwd(),
  linksDir = 'links',
  publicDir = 'public',
  baseUrl = ''
} = {}) {
  const links = await loadShortlinks({ rootDir, linksDir })
  const counts = validateShortlinks(links)
  const activeLinks = links.filter(link => link.status === 'active')

  const outDir = join(rootDir, publicDir)
  await mkdir(outDir, { recursive: true })

  await writeFile(join(outDir, '_redirects'), renderRedirects(activeLinks), 'utf8')
  await writeFile(join(outDir, 'map.json'), `${JSON.stringify(renderMap(activeLinks, baseUrl), null, 2)}\n`, 'utf8')
  await writeFallbackPages({ outDir, links: activeLinks })

  return counts
}

export function renderRedirects(links) {
  return links.map(link => `/${link.slug} ${link.url} 302`).join('\n') + (links.length ? '\n' : '')
}

export function renderMap(links, baseUrl = '') {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return links
    .filter(link => link.listed)
    .map(link => ({
      slug: link.slug,
      shortPath: `/${link.slug}`,
      shortUrl: normalizedBaseUrl ? `${normalizedBaseUrl}/${link.slug}` : `/${link.slug}`,
      url: link.url,
      title: link.title,
      description: link.description,
      description_zh: link.description_zh,
      description_en: link.description_en,
      code: link.code,
      category: link.category,
      tags: link.tags,
      featured: link.featured
    }))
}

function parseFrontmatter(source) {
  const result = {}
  const lines = source.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const scalarMatch = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/)
    if (!scalarMatch) continue

    const [, key, rawValue = ''] = scalarMatch
    if (rawValue === '') {
      const list = []
      while (lines[index + 1]?.match(/^\s+-\s+/)) {
        index += 1
        list.push(lines[index].replace(/^\s+-\s+/, '').trim())
      }
      result[key] = list.length ? list : ''
    } else {
      result[key] = coerceValue(rawValue.trim())
    }
  }

  return result
}

function coerceValue(value) {
  if (value === 'true') return true
  if (value === 'false') return false
  return value.replace(/^["']|["']$/g, '')
}

function isHttpUrl(value) {
  if (typeof value !== 'string') return false

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function writeFallbackPages({ outDir, links }) {
  for (const link of links) {
    const linkDir = join(outDir, link.slug)
    await mkdir(linkDir, { recursive: true })
    await writeFile(join(linkDir, 'index.html'), renderFallbackPage(link), 'utf8')
  }
}

function renderFallbackPage(link) {
  const target = escapeHtml(link.url)
  const title = escapeHtml(link.title || link.slug)

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${target}">
  <title>Redirecting to ${title}</title>
  <script>location.replace(${JSON.stringify(link.url)});</script>
</head>
<body>
  <p>Redirecting to <a href="${target}">${title}</a>.</p>
</body>
</html>
`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
