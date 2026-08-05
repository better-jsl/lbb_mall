param(
  [int]$AdminPort = 5173
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$adminRoot = Join-Path $root 'admin'

function Test-HttpEndpoint {
  param([string]$Url)

  try {
    return (Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2).StatusCode -eq 200
  } catch {
    return $false
  }
}

& (Join-Path $root 'backend\start-local.ps1') -Build

if (Test-HttpEndpoint "http://127.0.0.1:$AdminPort") {
  Write-Host "Admin is already running at http://127.0.0.1:$AdminPort"
  exit 0
}

if (-not (Test-Path -LiteralPath (Join-Path $adminRoot 'node_modules'))) {
  throw 'Admin dependencies are missing. Run npm install in the admin directory first.'
}

$adminProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev', '--', '--port', $AdminPort) -WorkingDirectory $adminRoot -WindowStyle Hidden -PassThru
for ($attempt = 0; $attempt -lt 15; $attempt += 1) {
  Start-Sleep -Seconds 1
  if (Test-HttpEndpoint "http://127.0.0.1:$AdminPort") {
    Write-Host "Admin started at http://127.0.0.1:$AdminPort (PID $($adminProcess.Id))"
    exit 0
  }
}

Stop-Process -Id $adminProcess.Id -Force -ErrorAction SilentlyContinue
throw "Admin did not start on port $AdminPort."
