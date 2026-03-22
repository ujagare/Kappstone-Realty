$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"

if (-not (Test-Path $envPath)) {
  throw ".env file not found at $envPath"
}

$envValues = @{}
Get-Content $envPath | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
    return
  }

  $parts = $line.Split("=", 2)
  $envValues[$parts[0].Trim()] = $parts[1].Trim()
}

$gaId = $envValues["GOOGLE_ANALYTICS_ID"]
$gtmId = $envValues["GOOGLE_TAG_MANAGER_ID"]
$searchConsole = $envValues["GOOGLE_SEARCH_CONSOLE_VERIFICATION"]

$searchConsoleBlock = ""
if ($searchConsole) {
  $searchConsoleBlock = @"
  <!-- Google Search Console Verification -->
  <meta name="google-site-verification" content="$searchConsole" />
  <!-- /Google Search Console Verification -->

"@
}

$gtmHeadBlock = ""
if ($gtmId) {
  $gtmHeadBlock = @"
  <!-- Google Tag Manager -->
  <script>
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','$gtmId');
  </script>
  <!-- /Google Tag Manager -->

"@
}

$gaBlock = ""
if ($gaId) {
  $gaBlock = @"
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=$gaId"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '$gaId');
  </script>
  <!-- /Google Analytics -->

"@
}

$gtmBodyBlock = ""
if ($gtmId) {
  $gtmBodyBlock = @"
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=$gtmId"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- /Google Tag Manager (noscript) -->
"@
}

$htmlFiles = Get-ChildItem $root -Filter "*.html"

foreach ($file in $htmlFiles) {
  $content = Get-Content -Raw $file.FullName

  $content = [regex]::Replace(
    $content,
    '(?s)\s*<!-- Google Search Console Verification -->.*?<!-- /Google Search Console Verification -->\s*',
    "`r`n"
  )
  $content = [regex]::Replace(
    $content,
    '(?s)\s*<!-- Google Tag Manager -->.*?<!-- /Google Tag Manager -->\s*',
    "`r`n"
  )
  $content = [regex]::Replace(
    $content,
    '(?s)\s*<!-- Google Analytics -->.*?<!-- /Google Analytics -->\s*',
    "`r`n"
  )
  $content = [regex]::Replace(
    $content,
    '(?s)\s*<!-- Google Tag Manager \(noscript\) -->.*?<!-- /Google Tag Manager \(noscript\) -->\s*',
    "`r`n"
  )

  $headInjection = ($searchConsoleBlock + $gtmHeadBlock + $gaBlock)
  if ($headInjection) {
    $content = $content -replace '</head>', ($headInjection + '</head>')
  }

  if ($gtmBodyBlock) {
    $content = [regex]::Replace(
      $content,
      '(<body\b[^>]*>)',
      "`$1`r`n`r`n$gtmBodyBlock",
      1
    )
  }

  Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Google integrations processed for $($htmlFiles.Count) HTML files."
if (-not $gaId) { Write-Host "GOOGLE_ANALYTICS_ID is empty, so GA was not injected." }
if (-not $gtmId) { Write-Host "GOOGLE_TAG_MANAGER_ID is empty, so GTM was not injected." }
if (-not $searchConsole) { Write-Host "GOOGLE_SEARCH_CONSOLE_VERIFICATION is empty, so verification meta tag was not injected." }
