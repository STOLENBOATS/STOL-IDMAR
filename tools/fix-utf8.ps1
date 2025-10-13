$ErrorActionPreference = "Stop"

# 0) snapshot
git add -A | Out-Null
try { git commit -m "backup: antes de normalizar UTF-8" | Out-Null } catch {}

# 1) ficheiros alvo
$patterns = @('*.js','*.html','*.css','*.json','*.md','*.yml','*.yaml')
$files = Get-ChildItem -Recurse -Include $patterns | Where-Object { -not $_.PSIsContainer }

function Has-Mojibake([string]$s){ return ($s -match 'Ã' -or $s -match '�') }
function Score([string]$s){
  $good = ([regex]::Matches($s,'[\u00C0-\u017F]')).Count
  $bad  = ([regex]::Matches($s,'Ã|�')).Count * 5
  return $good - $bad
}

[int]$changed = 0
foreach ($f in $files) {
  $bytes  = [IO.File]::ReadAllBytes($f.FullName)
  $asUtf8 = [Text.Encoding]::UTF8.GetString($bytes)
  if (-not (Has-Mojibake $asUtf8)) { continue }

  $cp1252 = [Text.Encoding]::GetEncoding(1252).GetString($bytes)
  $latin1 = [Text.Encoding]::GetEncoding(28591).GetString($bytes)

  $cands = @(
    @{ name='cp1252'; text=$cp1252; score=(Score $cp1252) },
    @{ name='latin1'; text=$latin1; score=(Score $latin1) }
  ) | Sort-Object score -Descending

  if ($cands[0].score -le (Score $asUtf8)) { continue }

  $utf8Bytes = [Text.Encoding]::UTF8.GetBytes($cands[0].text)
  [IO.File]::WriteAllBytes($f.FullName, $utf8Bytes)
  Write-Host ("Fix UTF-8 → {0} (via {1})" -f $f.FullName, $cands[0].name)
  $changed++
}

Write-Host "Convertidos: $changed ficheiro(s)."
if ($changed -gt 0) {
  git add -A | Out-Null
  git commit -m "fix(utf8): normalizar fontes para UTF-8 (cp1252/latin1 -> UTF-8)" | Out-Null
}
