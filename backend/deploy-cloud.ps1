param(
  [Parameter(Mandatory)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$KeyPath,
  [string]$HostName = '106.55.35.162',
  [string]$User = 'ubuntu',
  [switch]$RestartNginx
)

$ErrorActionPreference = 'Stop'
$backendRoot = $PSScriptRoot
$projectRoot = Split-Path -Parent $backendRoot
$archivePath = Join-Path ([System.IO.Path]::GetTempPath()) ("lbb-backend-{0}.tgz" -f [guid]::NewGuid())
$sshKeyPath = Join-Path ([System.IO.Path]::GetTempPath()) ("lbb-deploy-key-{0}.pem" -f [guid]::NewGuid())
$target = "${User}@${HostName}"

try {
  Copy-Item -LiteralPath $KeyPath -Destination $sshKeyPath
  & icacls.exe $sshKeyPath /inheritance:r | Out-Null
  & icacls.exe $sshKeyPath /grant:r "$env:USERNAME`:(R)" | Out-Null

  Push-Location $projectRoot
  & tar.exe -czf $archivePath `
    --exclude=backend/.env `
    --exclude=backend/.go-cache `
    --exclude=backend/.gocache `
    --exclude=backend/secrets `
    --exclude=backend/uploads `
    --exclude=backend/lbb-mall-api.exe `
    backend
  if ($LASTEXITCODE -ne 0) { throw 'Failed to package backend source.' }

  & scp -i $sshKeyPath $archivePath "${target}:/tmp/lbb-deploy/backend-source.tgz"
  if ($LASTEXITCODE -ne 0) { throw 'Failed to upload backend source.' }

  $remoteCommand = 'sudo tar -xzf /tmp/lbb-deploy/backend-source.tgz -C /opt/lbb_mall; cd /opt/lbb_mall/backend; sudo docker compose -f compose.cloud.yml up -d --build api'
  if ($RestartNginx) {
    $remoteCommand += '; sudo docker compose -f compose.cloud.yml -f compose.edge.yml up -d nginx'
  }
  $remoteCommand += '; curl -fsS http://127.0.0.1:8080/healthz'

  & ssh -i $sshKeyPath -o BatchMode=yes $target $remoteCommand
  if ($LASTEXITCODE -ne 0) { throw 'Cloud deployment failed.' }
} finally {
  Pop-Location -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $archivePath -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $sshKeyPath -Force -ErrorAction SilentlyContinue
}
