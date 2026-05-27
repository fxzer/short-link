#!/usr/bin/env node
import { buildShortlinks } from './lib/shortlinks.js'

const baseUrl = process.env.SITE_URL || ''
const result = await buildShortlinks({ rootDir: process.cwd(), baseUrl })

console.log(
  `Built ${result.redirectCount} redirects and ${result.listedCount} listed links into public/.`
)
