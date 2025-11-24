$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

try {
    $null = Get-Command cargo -ErrorAction Stop
} catch {
    Write-Host "Erro: Rust/Cargo nao esta instalado" -ForegroundColor Red
    Write-Host "Instale em: https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

$linkerFound = $false
try {
    $null = Get-Command link.exe -ErrorAction Stop
    $linkerFound = $true
} catch {
    $vsPaths = @(
        "${env:ProgramFiles}\Microsoft Visual Studio\18\Community\VC\Tools\MSVC",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC"
    )
    
    foreach ($vsPath in $vsPaths) {
        if (Test-Path $vsPath) {
            $linkerFile = Get-ChildItem -Path $vsPath -Recurse -Filter "link.exe" -ErrorAction SilentlyContinue | 
                Where-Object { $_.FullName -match "Hostx64\\x64" } | 
                Select-Object -First 1
            
            if ($linkerFile) {
                $env:PATH = "$($linkerFile.DirectoryName);$env:PATH"
                $linkerFound = $true
                break
            }
        }
    }
}

$targets = rustup target list --installed
if ($targets -notmatch "wasm32-wasip1") {
    rustup target add wasm32-wasip1
}

if (-not $env:CARGO_TARGET_DIR) {
    $tempTargetDir = Join-Path $env:TEMP "cargo-target"
    if (-not (Test-Path $tempTargetDir)) {
        New-Item -ItemType Directory -Path $tempTargetDir -Force | Out-Null
    }
    $env:CARGO_TARGET_DIR = $tempTargetDir
}

cargo build --target wasm32-wasip1 --release

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro na compilacao!" -ForegroundColor Red
    exit 1
}

$buildDir = Join-Path (Split-Path -Parent (Split-Path -Parent $scriptDir)) "backend\wasm\build"
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir -Force | Out-Null
}

$sourceFile = $null
if ($env:CARGO_TARGET_DIR) {
    $cargoTargetFile = Join-Path $env:CARGO_TARGET_DIR "wasm32-wasip1\release\password_hash.wasm"
    if (Test-Path $cargoTargetFile) {
        $sourceFile = $cargoTargetFile
    }
}
if (-not $sourceFile) {
    $sourceFile = Join-Path $scriptDir "target\wasm32-wasip1\release\password_hash.wasm"
}

$destFile = Join-Path $buildDir "password_hash.wasm"

if (-not (Test-Path $sourceFile)) {
    Write-Host "Erro: Ficheiro WASM nao encontrado" -ForegroundColor Red
    exit 1
}

Copy-Item -Path $sourceFile -Destination $destFile -Force
