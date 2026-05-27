#!/usr/bin/env node
import { loadShortlinks, validateShortlinks } from './lib/shortlinks.js'

const links = await loadShortlinks({ rootDir: process.cwd() })
const result = validateShortlinks(links)

console.log(
  `Validated ${result.totalCount} links: ${result.redirectCount} redirects, ${result.listedCount} listed.`
)
