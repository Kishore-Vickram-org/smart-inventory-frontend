/* eslint-disable no-console */

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const args = { threshold: 80 }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--threshold') {
      const v = Number(argv[i + 1])
      if (!Number.isFinite(v)) throw new Error(`Invalid --threshold value: ${argv[i + 1]}`)
      args.threshold = v
      i += 1
      continue
    }
  }
  return args
}

function readCoverageSummary() {
  const summaryPath = path.resolve(process.cwd(), 'coverage', 'coverage-summary.json')
  if (fs.existsSync(summaryPath)) {
    const raw = fs.readFileSync(summaryPath, 'utf8')
    return { kind: 'summary', data: JSON.parse(raw) }
  }

  // CRA/Jest default includes coverage-final.json (reporter: json)
  const finalPath = path.resolve(process.cwd(), 'coverage', 'coverage-final.json')
  if (fs.existsSync(finalPath)) {
    const raw = fs.readFileSync(finalPath, 'utf8')
    return { kind: 'final', data: JSON.parse(raw) }
  }

  throw new Error(
    [
      'No coverage JSON found in coverage/.',
      'Expected coverage/coverage-summary.json or coverage/coverage-final.json.',
      'Run tests with coverage first (e.g. `npm run test:coverage`).',
    ].join(' '),
  )
}

function pct(v) {
  return typeof v === 'number' ? v : 0
}

function main() {
  const { threshold } = parseArgs(process.argv)
  const coverage = readCoverageSummary()

  let metrics
  if (coverage.kind === 'summary') {
    const total = coverage.data.total || {}
    metrics = {
      lines: pct(total.lines?.pct),
      statements: pct(total.statements?.pct),
      functions: pct(total.functions?.pct),
      branches: pct(total.branches?.pct),
    }
  } else {
    const byFile = coverage.data
    const totals = {
      statements: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      branches: { total: 0, covered: 0 },
      // Lines are approximated from statement start lines (good enough for a CI gate)
      lines: { total: 0, covered: 0 },
    }

    for (const file of Object.values(byFile)) {
      const statementIds = Object.keys(file.statementMap || {})
      totals.statements.total += statementIds.length
      for (const id of statementIds) {
        if ((file.s || {})[id] > 0) totals.statements.covered += 1
      }

      const fnIds = Object.keys(file.fnMap || {})
      totals.functions.total += fnIds.length
      for (const id of fnIds) {
        if ((file.f || {})[id] > 0) totals.functions.covered += 1
      }

      const branchIds = Object.keys(file.branchMap || {})
      for (const id of branchIds) {
        const arr = (file.b || {})[id] || []
        totals.branches.total += arr.length
        for (const v of arr) {
          if (v > 0) totals.branches.covered += 1
        }
      }

      const lineSet = new Set()
      const coveredLineSet = new Set()
      for (const id of statementIds) {
        const loc = (file.statementMap || {})[id]
        const line = loc?.start?.line
        if (typeof line !== 'number') continue
        lineSet.add(line)
        if ((file.s || {})[id] > 0) coveredLineSet.add(line)
      }
      totals.lines.total += lineSet.size
      totals.lines.covered += coveredLineSet.size
    }

    const pctOf = ({ total, covered }) => (total === 0 ? 100 : Math.round((covered / total) * 10000) / 100)
    metrics = {
      lines: pctOf(totals.lines),
      statements: pctOf(totals.statements),
      functions: pctOf(totals.functions),
      branches: pctOf(totals.branches),
    }
  }

  console.log('Coverage totals:', metrics)
  console.log(`Required threshold: ${threshold}%`) 

  const failed = Object.entries(metrics)
    .filter(([, value]) => value < threshold)
    .map(([key, value]) => `${key}=${value}%`)

  if (failed.length > 0) {
    console.error(`FAILED coverage threshold (${threshold}%). Below: ${failed.join(', ')}`)
    process.exit(1)
  }

  console.log('OK: coverage threshold met.')
}

main()
