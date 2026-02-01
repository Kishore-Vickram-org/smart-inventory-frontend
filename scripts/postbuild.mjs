import { cp, rm, stat } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const distDir = path.join(root, 'dist')
const buildDir = path.join(root, 'build')

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

if (!(await exists(distDir))) {
  console.error(`[postbuild] Expected dist output missing: ${distDir}`)
  process.exit(1)
}

await rm(buildDir, { recursive: true, force: true })
await cp(distDir, buildDir, { recursive: true })
console.log(`[postbuild] Copied dist -> build`) 
