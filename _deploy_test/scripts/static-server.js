const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { URL } = require('node:url')

const port = Number.parseInt(process.env.PORT || '8080', 10)
const buildDir = path.resolve(__dirname, '..', 'build')

function contentTypeFor(filePath) {
  switch (path.extname(filePath).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.ico':
      return 'image/x-icon'
    case '.txt':
      return 'text/plain; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function safeResolveFromBuildDir(requestPathname) {
  const decoded = decodeURIComponent(requestPathname)
  const stripped = decoded.replace(/^\/+/, '')
  const resolved = path.resolve(buildDir, stripped)
  if (!resolved.startsWith(buildDir + path.sep) && resolved !== buildDir) {
    return null
  }
  return resolved
}

function sendFile(res, filePath) {
  const stream = fs.createReadStream(filePath)
  res.statusCode = 200
  res.setHeader('Content-Type', contentTypeFor(filePath))

  stream.on('error', () => {
    res.statusCode = 500
    res.end('Internal Server Error')
  })

  stream.pipe(res)
}

function sendIndexHtml(res) {
  const indexPath = path.join(buildDir, 'index.html')
  fs.stat(indexPath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('index.html not found. Did you run `npm run build`?')
      return
    }
    sendFile(res, indexPath)
  })
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname || '/'

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end('Method Not Allowed')
    return
  }

  if (pathname === '/' || pathname === '') {
    sendIndexHtml(res)
    return
  }

  const resolved = safeResolveFromBuildDir(pathname)
  if (!resolved) {
    res.statusCode = 400
    res.end('Bad Request')
    return
  }

  fs.stat(resolved, (err, stat) => {
    if (!err && stat.isFile()) {
      if (req.method === 'HEAD') {
        res.statusCode = 200
        res.setHeader('Content-Type', contentTypeFor(resolved))
        res.end()
        return
      }
      sendFile(res, resolved)
      return
    }

    // SPA fallback for client-side routes (React Router)
    sendIndexHtml(res)
  })
})

server.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${buildDir} on port ${port}`)
})
