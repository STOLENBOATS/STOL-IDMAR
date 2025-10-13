param(
  [string]$Root = ".",
  [switch]$NoBom
)
$ErrorActionPreference = 'Stop'

function Fix-Mojibake {
  param([string]$Path)

  if (!(Test-Path $Path)) { return }

  $raw   = Get-Content -Raw -Path $Path -Encoding byte

  # Tentativa de reinterpretação CP1252 -> UTF8
  $cp1252 = [Text.Encoding]::GetEncoding(1252)
  $as1252 = $cp1252.GetString($raw)
  $fixed  = [Text.Encoding]::UTF8.GetBytes($as1252)

  # Se a versão corrigida reduzir padrões de mojibake, usa-a
  $bad   = ([Text.Encoding]::UTF8.GetString($raw)   -match '[ÃÂ�]')
  $goodr = ([Text.Encoding]::UTF8.GetString($fixed) -match '[ÃÂ�]') -eq $false

  $finalBytes = if ($bad -and $goodr) { $fixed } else { $raw }

  if ($NoBom) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($Path, [Text.Encoding]::UTF8.GetString($finalBytes), $utf8NoBom)
  } else {
    Set-Content -Path $Path -Value ([Text.Encoding]::UTF8.GetString($finalBytes)) -Encoding UTF8
  }
  Write-Host "OK: $Path"
}

$exts = @("*.html","*.js","*.css","*.json")
$files = Get-ChildItem -Path $Root -Recurse -Include $exts | Where-Object { -not $_.PSIsContainer }

foreach($f in $files){
  try { Fix-Mojibake -Path $f.FullName } catch { Write-Host "ERRO: $($f.FullName) — $_" -f Red }
}
