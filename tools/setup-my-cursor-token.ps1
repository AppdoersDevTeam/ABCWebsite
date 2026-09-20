param(
  [string]$HubUrl = "https://appdoers-hub-two.vercel.app"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 18+ is required."
}

$env:APPDOERS_HUB_URL = $HubUrl
Set-Location $RepoRoot
node (Join-Path $PSScriptRoot "setup-hub-token.mjs")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
