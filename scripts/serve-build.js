const { spawn } = require('node:child_process')
const path = require('node:path')

const port = process.env.PORT || '3000'
const isWindows = process.platform === 'win32'

const serveBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  isWindows ? 'serve.cmd' : 'serve',
)

let child
if (isWindows) {
  child = spawn(serveBin, ['-s', 'build', '-l', String(port)], {
    stdio: 'inherit',
    shell: true,
    env: process.env,
  })
} else {
  child = spawn(serveBin, ['-s', 'build', '-l', String(port)], {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  })
}

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
