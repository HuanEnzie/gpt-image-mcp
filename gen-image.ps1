param(
  [Parameter(Mandatory=$true)][string]$Prompt,
  [Parameter(Mandatory=$true)][string]$Out,
  [string]$Size = "1024x1024",
  [string]$Model = "gpt-image-2",
  [string]$Base = "http://127.0.0.1:10531/v1"
)
$body = @{ model=$Model; prompt=$Prompt; size=$Size; n=1 } | ConvertTo-Json
try {
  $r = Invoke-RestMethod -Uri "$Base/images/generations" -Method Post -ContentType "application/json; charset=utf-8" -Body ([Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 280
} catch {
  Write-Error "Loi goi API (server da chay chua? npx -y -p openai-oauth -p zod openai-oauth --detach): $($_.Exception.Message) $($_.ErrorDetails.Message)"
  exit 1
}
$d = $r.data[0]
$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
if ($d.b64_json) { [IO.File]::WriteAllBytes($Out, [Convert]::FromBase64String($d.b64_json)) }
elseif ($d.url) { Invoke-WebRequest $d.url -OutFile $Out }
else { Write-Error "Khong co du lieu anh trong phan hoi"; exit 1 }
Write-Output "Saved: $Out"
