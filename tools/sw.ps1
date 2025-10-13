param(
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

function Go-ToRepoRoot {
  if (Test-Path .git) { return }
  try {
    $root = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -eq 0 -and $root) { Set-Location $root }
  } catch {}
  if (-not (Test-Path .git)) { throw "Não estás numa pasta de repositório Git." }
}

function Get-BasePath {
  # BasePath para GitHub Pages Project site: /REPO/
  $origin = git remote get-url origin 2>$null
  if (-not $origin) { throw "Sem remote 'origin'." }

  if ($origin -match '[:/](?<owner>[^/]+)/(?<repo>[^/]+?)(?:\.git)?$') {
    $owner = $Matches.owner
    $repo  = $Matches.repo
  } else {
    throw "Não consegui extrair owner/repo de: $origin"
  }

  $hasCNAME = Test-Path -LiteralPath 'CNAME'
  $isUserSite = ($repo -ieq "$owner.github.io" -or $repo -match '\.github\.io$')

  if ($isUserSite -or $hasCNAME) { 
    return "/" 
  } else { 
    return "/$repo/" 
  }
}

function Get-LocalAssets([string]$htmlPath, [string]$basePath) {
  if (-not (Test-Path $htmlPath)) { throw "Falta $htmlPath" }
  $html = Get-Content $htmlPath -Raw

  # apanhar href/src relativos (ignorar http(s):, //, data:, mailto:, tel:, #)
  $regex = '(?i)(?:\s(?:src|href)\s*=\s*["''])(?<url>[^"'']+)(?:["''])'
  $urls = New-Object 'System.Collections.Generic.HashSet[string]'

  foreach ($m in [regex]::Matches($html, $regex)) {
    $u = ($m.Groups['url'].Value).Trim()
    if ($u -match '^(https?:)?//' -or $u -match '^(data:|mailto:|tel:|#)') { continue }
    if ($u -match '^\s*$') { continue }

    # normalizar caminhos
    $norm = $null
    if ($u.StartsWith('/')) {
      $norm = $u
    } else {
      $norm = ($basePath.TrimEnd('/') + '/' + $u).Replace('//','/')
    }

    $ext = [IO.Path]::GetExtension($norm).ToLowerInvariant()
    if ($ext -in @('.html','.css','.js','.json','.png','.jpg','.jpeg','.svg','.webp','.ico')) {
      [void]$urls.Add($norm)
    }
  }

  # garantir páginas & manifest & ícones comuns
  [void]$urls.Add( ($basePath.TrimEnd('/') + '/validador.html').Replace('//','/') )
  if (Test-Path 'manifest.webmanifest') { [void]$urls.Add( ($basePath.TrimEnd('/') + '/manifest.webmanifest') ) }
  if (Test-Path 'img/logo-pm.png')      { [void]$urls.Add( ($basePath.TrimEnd('/') + '/img/logo-pm.png') ) }
  if (Test-Path 'img/logo-pm-512.png')  { [void]$urls.Add( ($basePath.TrimEnd('/') + '/img/logo-pm-512.png') ) }

  return [string[]]$urls
}

function Write-ServiceWorker([string[]]$assets, [string]$basePath) {
  $cacheVer = "idmar-cache-" + (Get-Date -Format 'yyyyMMddHHmmss')
  $assetsSorted = $assets | Sort-Object
  $assetsJs = ($assetsSorted -join "',`n  '")

  $fallback = ($basePath.TrimEnd('/') + '/validador.html')

$sw = @"
// sw.js — gerado por tools/build-sw.ps1
const CACHE_NAME = '$cacheVer';
const ASSETS = [
  '$assetsJs'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k===CACHE_NAME? null : caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// cache-first básico para GET do mesmo domínio
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // fallback html
        const fallback = '$fallback';
        const accept = req.headers.get('accept');
        if (accept && accept.indexOf('text/html') !== -1) {
          return caches.match(fallback);
        }
      });
    })
  );
});
"@

  Set-Content -Path 'sw.js' -Value $sw -Encoding utf8
}

function Ensure-SW-Registration([string]$htmlPath, [string]$basePath) {
  $orig = Get-Content $htmlPath -Raw
  if ($orig -match 'navigator\.serviceWorker\.register') { return $false }

$snippet = @"
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('$basePath`sw.js').catch(console.error);
  });
}
</script>
"@

  $updated = [regex]::Replace($orig, '(?i)</body>', ($snippet + "`r`n</body>"), 1)
  if ($updated -eq $orig) {
    $updated = $orig + "`r`n" + $snippet  # fallback, caso não encontre </body>
  }
  $bak = "$htmlPath.bak-sw-" + (Get-Date -Format yyyyMMddHHmmss)
  Set-Content $bak -Value $orig -Encoding utf8
  Set-Content $htmlPath -Value $updated -Encoding utf8
  return $true
}

# -------------------- RUN --------------------
Go-ToRepoRoot
$base = Get-BasePath
Write-Host "BasePath: $base"

$assets = Get-LocalAssets -htmlPath 'validador.html' -basePath $base
Write-ServiceWorker -assets $assets -basePath $base
$changed = Ensure-SW-Registration -htmlPath 'validador.html' -basePath $base

git add sw.js validador.html 2>$null
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm'
$commitMsg = "PWA: gerar sw.js + registo (basePath=$base) [$stamp]"
git commit -m $commitMsg 2>$null | Out-Null

if ($Push) { git push }

Write-Host "OK: sw.js gerado com $(($assets).Count) assets; commit criado." -ForegroundColor Green
if ($changed) { Write-Host "Registo do SW injetado em validador.html (backup criado)." }
