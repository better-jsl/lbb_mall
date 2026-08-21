$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$envFile = Join-Path $root '.env'
if (-not (Test-Path -LiteralPath $envFile)) {
  throw 'Missing backend/.env.'
}

Get-Content -LiteralPath $envFile | ForEach-Object {
  if ($_ -match '^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
  }
}

Push-Location $root
try {
  $env:GOCACHE = Join-Path (Split-Path $root -Parent) '.tmp-go-cache'
  & go run . --download-wechat-pay-platform-cert
  if ($LASTEXITCODE -ne 0) { throw 'Platform certificate download failed.' }
} finally {
  Pop-Location
}
