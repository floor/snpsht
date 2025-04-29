#!/usr/bin/env bun
import { mkdir, chmod } from 'fs/promises'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST_DIR = join(__dirname, 'dist')

console.log('🚀 Building snpsht package with Bun...')

// Ensure dist directory exists
if (!existsSync(DIST_DIR)) {
  await mkdir(DIST_DIR, { recursive: true })
}

try {
  // Run TypeScript compiler via Bun
  const tscProcess = Bun.spawn(['bun', 'node_modules/.bin/tsc'], {
    cwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'inherit']
  })

  const exitCode = await tscProcess.exited

  if (exitCode !== 0) {
    console.error(`❌ TypeScript compilation failed with code ${exitCode}`)
    process.exit(1)
  }

  console.log('✅ TypeScript compilation successful')

  // Make CLI executable
  const cliPath = join(DIST_DIR, 'cli.js')
  if (existsSync(cliPath)) {
    await chmod(cliPath, 0o755)
    console.log('✅ Made CLI executable')
  }
} catch (error) {
  console.error('❌ Build error:', error)
  process.exit(1)
}
