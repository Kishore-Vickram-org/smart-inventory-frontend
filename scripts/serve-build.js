const { spawn } = require('node:child_process')
const path = require('node:path')

// Serve the CRA production build using the local `serve` dependency.
// Respects $PORT for Azure/App Service and other hosts.
const port = process.env.PORT || '8080'
const isWindows = process.platform === 'win32'

const serveBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  isWindows ? 'serve.cmd' : 'serve',
)

const args = ['-s', 'build', '-l', String(port)]

const child = spawn(serveBin, args, {
  stdio: 'inherit',
  shell: isWindows,
  env: process.env,
})

child.on('exit', (code) => process.exit(code ?? 0))
