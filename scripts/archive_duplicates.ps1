$ErrorActionPreference = 'Stop'

$root = 'd:\Universidad\Impulsa UTP\Reto 1\Codigo Fuente'
$docs = Join-Path $root 'DOCS'
$arch = Join-Path $docs 'ARCHIVED'

New-Item -ItemType Directory -Force -Path $arch | Out-Null

function Move-IfExists {
  param([string]$Path,[string]$Dest)
  if (Test-Path -LiteralPath $Path) {
    Move-Item -Force -LiteralPath $Path -Destination $Dest
    return [System.IO.Path]::GetFileName($Path)
  }
  return $null
}

$moved = @()

# Elegimos mantener DATABASE_MODELING.md y archivar DATABASE_ARCHITECTURE.md
$m = Move-IfExists -Path (Join-Path $docs 'DATABASE_ARCHITECTURE.md') -Dest $arch; if ($m) { $moved += $m }

# Archivar guías N8N redundantes/antiguas
foreach ($name in @(
  'N8N_PASO_A_PASO_IMPLEMENTACION.md',
  'N8N_NORMALIZER_UPDATE_GUIDE.md',
  'N8N_DISCOVERY_AGENT_UPDATE_GUIDE.md',
  'architecture-insightbot-v2.md',
  'implementation-guide.md'
)) {
  $m = Move-IfExists -Path (Join-Path $docs $name) -Dest $arch
  if ($m) { $moved += $m }
}

Write-Host ('Archived: ' + ($moved -join ', '))
Write-Host 'Duplicate cleanup complete.'
