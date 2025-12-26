#!/usr/bin/env node
import { unlink } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const manifestPath = resolve(dirname(__filename), '..', 'dist', 'manifest.json')

try {
  await unlink(manifestPath)
} catch (error) {
  console.error(`Failed to remove manifest file at "${manifestPath}":`, error instanceof Error ? error.message : error)
  throw error
}
