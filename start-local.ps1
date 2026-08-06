param(
  [int]$AdminPort = 5173,
  [int]$H5Port = 5174
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$adminRoot = Join-Path $root 'admin'
$h5Root = Join-Path $root 'h5'

function Test-HttpEndpoint {
  param([string]$Url)

  try {
    return (Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2).StatusCode -eq 200
  } catch {
    return $false
  }
}

function Get-LanIPv4 {
  $address = [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
    Where-Object {
      $_.OperationalStatus -eq 'Up' -and
      $_.NetworkInterfaceType -notin @([System.Net.NetworkInformation.NetworkInterfaceType]::Loopback, [System.Net.NetworkInformation.NetworkInterfaceType]::Tunnel) -and
      $_.GetIPProperties().GatewayAddresses.Address.AddressFamily -contains [System.Net.Sockets.AddressFamily]::InterNetwork
    } |
    ForEach-Object {
      $_.GetIPProperties().UnicastAddresses |
        Where-Object {
          $_.Address.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and
          -not $_.Address.IPAddressToString.StartsWith('169.254.')
        } |
        Select-Object -First 1 -ExpandProperty Address
    } |
    Select-Object -First 1

  return $address.IPAddressToString
}

& (Join-Path $root 'backend\start-local.ps1') -Build

if (Test-HttpEndpoint "http://127.0.0.1:$AdminPort") {
  Write-Host "Admin is already running at http://127.0.0.1:$AdminPort"
} else {
  if (-not (Test-Path -LiteralPath (Join-Path $adminRoot 'node_modules'))) {
    throw 'Admin dependencies are missing. Run npm install in the admin directory first.'
  }

  $adminProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev', '--', '--port', $AdminPort) -WorkingDirectory $adminRoot -WindowStyle Hidden -PassThru
  for ($attempt = 0; $attempt -lt 15; $attempt += 1) {
    Start-Sleep -Seconds 1
    if (Test-HttpEndpoint "http://127.0.0.1:$AdminPort") {
      Write-Host "Admin started at http://127.0.0.1:$AdminPort (PID $($adminProcess.Id))"
      break
    }
  }
  if (-not (Test-HttpEndpoint "http://127.0.0.1:$AdminPort")) {
    Stop-Process -Id $adminProcess.Id -Force -ErrorAction SilentlyContinue
    throw "Admin did not start on port $AdminPort."
  }
}

if (Test-HttpEndpoint "http://127.0.0.1:$H5Port") {
  Write-Host "H5 is already running at http://127.0.0.1:$H5Port"
} else {
  if (-not (Test-Path -LiteralPath (Join-Path $h5Root 'node_modules'))) {
    throw 'H5 dependencies are missing. Run npm install in the h5 directory first.'
  }

  $h5Process = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', 'dev', '--', '--port', $H5Port) -WorkingDirectory $h5Root -WindowStyle Hidden -PassThru
  for ($attempt = 0; $attempt -lt 15; $attempt += 1) {
    Start-Sleep -Seconds 1
    if (Test-HttpEndpoint "http://127.0.0.1:$H5Port") {
      Write-Host "H5 started at http://127.0.0.1:$H5Port (PID $($h5Process.Id))"
      break
    }
  }
  if (-not (Test-HttpEndpoint "http://127.0.0.1:$H5Port")) {
    Stop-Process -Id $h5Process.Id -Force -ErrorAction SilentlyContinue
    throw "H5 did not start on port $H5Port."
  }
}

$lanIP = Get-LanIPv4
if (-not $lanIP) {
  throw 'No LAN IPv4 address was detected. Connect to Wi-Fi or Ethernet, then run the script again.'
}

Write-Host ''
Write-Host 'Access URLs:'
Write-Host "Admin (local): http://127.0.0.1:$AdminPort"
Write-Host "Admin (phone): http://${lanIP}:$AdminPort"
Write-Host "H5 (local): http://127.0.0.1:$H5Port"
Write-Host "H5 (phone): http://${lanIP}:$H5Port"
