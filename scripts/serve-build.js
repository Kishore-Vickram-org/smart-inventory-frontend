const { spawn } = require('node:child_process')
const path = require('node:path')

const port = process.env.PORT || '8080'
const isWindows = process.platform === 'win32'

const viteBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  isWindows ? 'vite.cmd' : 'vite',
)

let child
if (isWindows) {
  child = spawn(viteBin, ['preview', '--host', '0.0.0.0', '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })
} else {
  child = spawn(viteBin, ['preview', '--host', '0.0.0.0', '--port', String(port), '--strictPort'], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })
}

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
