param(
  [int]$Port = 8080,
  [switch]$Build,
  [switch]$Foreground
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$exe = Join-Path $root 'lbb-mall-api.exe'
$envFile = Join-Path $root '.env'

if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$') {
      [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
  }
}

function Test-BackendHealth {
  param([int]$HealthPort)

  try {
    $response = Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:$HealthPort/healthz" -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (Test-BackendHealth $Port) {
  Write-Host "Backend is already running at http://127.0.0.1:$Port"
  exit 0
}

if ($Build -or -not (Test-Path -LiteralPath $exe)) {
  Push-Location $root
  try {
    $env:GOCACHE = Join-Path $root '.gocache'
    & go build -o $exe .
    if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
  } finally {
    Pop-Location
  }
}

if ($Foreground) {
  & $exe
  exit $LASTEXITCODE
}

$process = Start-Process -FilePath $exe -WorkingDirectory $root -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 1

if (-not (Test-BackendHealth $Port)) {
  Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
  throw "Backend did not start on port $Port."
}

Write-Host "Backend started at http://127.0.0.1:$Port (PID $($process.Id))"
