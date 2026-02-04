param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'

function Test-Http([string]$Url) {
  try {
    $res = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $res.StatusCode -ge 200 -and $res.StatusCode -lt 500
  } catch {
    return $false
  }
}

$rootUrl = "http://localhost:$Port/"
if (Test-Http $rootUrl) {
  Write-Host "Frontend already running on $rootUrl" -ForegroundColor Green
  exit 0
}

$listen = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($listen) {
  for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    if (Test-Http $rootUrl) {
      Write-Host "Frontend became ready on $rootUrl" -ForegroundColor Green
      exit 0
    }
  }

  $procId = $listen | Select-Object -First 1 -ExpandProperty OwningProcess
  $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
  Write-Host "Port $Port is already in use by PID $procId ($($proc.ProcessName))." -ForegroundColor Yellow
  exit 1
}

Set-Location "$PSScriptRoot"
if (-not (Test-Path "node_modules")) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
  & npm install
}

$pidFile = Join-Path $PSScriptRoot ".frontend.pid"
$outLog = Join-Path $PSScriptRoot "frontend.log"
$errLog = Join-Path $PSScriptRoot "frontend.err.log"

if (Test-Path $pidFile) {
  Remove-Item -Force $pidFile -ErrorAction SilentlyContinue
}

Write-Host "Starting frontend on port $Port..." -ForegroundColor Cyan

$env:BROWSER = "none"

$proc = Start-Process -FilePath "npm" -ArgumentList @("run", "dev", "--", "--port", "$Port") -WorkingDirectory $PSScriptRoot -NoNewWindow -PassThru -RedirectStandardOutput $outLog -RedirectStandardError $errLog
Set-Content -LiteralPath $pidFile -Value $proc.Id -Encoding ascii

for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  if (Test-Http $rootUrl) {
    Write-Host "Frontend ready on $rootUrl (PID $($proc.Id))" -ForegroundColor Green
    exit 0
  }

  if ($proc.HasExited) {
    Write-Host "Frontend process exited early (code $($proc.ExitCode))." -ForegroundColor Red
    if (Test-Path $errLog) {
      Write-Host "--- frontend.err.log (tail) ---" -ForegroundColor DarkGray
      Get-Content -LiteralPath $errLog -Tail 60
    }
    exit 1
  }
}

Write-Host "Frontend did not become ready within 30 seconds on $rootUrl." -ForegroundColor Red
exit 1
