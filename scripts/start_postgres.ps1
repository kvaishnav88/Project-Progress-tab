# Start local AuraGen PostgreSQL on port 5433 (Windows / PostgreSQL 17)
$ErrorActionPreference = "Stop"
$bin = "C:\Program Files\PostgreSQL\17\bin"
$root = Split-Path -Parent $PSScriptRoot
$pgdata = Join-Path $root ".pgdata"

if (-not (Test-Path "$bin\pg_ctl.exe")) {
  Write-Error "PostgreSQL 17 not found at $bin"
}

if (-not (Test-Path "$pgdata\PG_VERSION")) {
  Write-Host "Initializing cluster at $pgdata ..."
  & "$bin\initdb.exe" -D $pgdata -U auragen -A trust -E UTF8 --no-locale
}

$status = & "$bin\pg_ctl.exe" -D $pgdata status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Starting PostgreSQL on port 5433 ..."
  & "$bin\pg_ctl.exe" -D $pgdata -l "$pgdata\logfile.log" -o "-p 5433" start
} else {
  Write-Host "PostgreSQL already running."
}

$createdbOut = & "$bin\createdb.exe" -h 127.0.0.1 -p 5433 -U auragen auragen 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Database 'auragen' already exists (ok)."
}
& "$bin\psql.exe" -h 127.0.0.1 -p 5433 -U auragen -d auragen -c "SELECT 'auragen db ready' AS status;"
