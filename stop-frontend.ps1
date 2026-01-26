param(
  [int]$Port = 5173
)

$ErrorActionPreference = 'Stop'

$pidFile = Join-Path $PSScriptRoot ".frontend.pid"

$listen = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if (-not $listen) {
  Write-Host "No process is listening on port $Port." -ForegroundColor Green
  exit 0
}

$procIds = $listen | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $procIds) {
  try {
    $proc = Get-Process -Id $procId -ErrorAction Stop
    Write-Host "Stopping PID $procId ($($proc.ProcessName)) listening on port $Port..." -ForegroundColor Yellow
    Stop-Process -Id $procId -Force
  } catch {
    Write-Host "Failed to stop PID ${procId}: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
  }
}

Start-Sleep -Seconds 1
$still = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
if ($still) {
  Write-Host "Port $Port is still in use after stop attempt." -ForegroundColor Red
  exit 1
}

Write-Host "Port $Port is now free." -ForegroundColor Green

if (Test-Path $pidFile) {
  Remove-Item -Force $pidFile -ErrorAction SilentlyContinue
}

exit 0
