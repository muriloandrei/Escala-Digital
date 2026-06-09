$ErrorActionPreference = "Stop"

try {
  $response = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 3
  Write-Host "Servidor OK:" ($response | ConvertTo-Json -Compress)
} catch {
  Write-Host "Servidor nao respondeu em http://localhost:3000/health"
  Write-Host $_.Exception.Message
  exit 1
}
