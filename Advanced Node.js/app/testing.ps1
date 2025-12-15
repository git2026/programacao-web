# Script de teste para o servidor Advanced Node.js
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=== Teste do Servidor ===" -ForegroundColor Cyan
$baseUrl = "http://localhost:3000"
$errors = 0

# Teste 1: Health Check
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    Write-Host "[OK] Servidor a funcionar (Worker: $($response.worker))" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Servidor nao responde. Execute: npm start" -ForegroundColor Red
    exit 1
}

# Teste 2: Clustering
$workers = @()
1..3 | ForEach-Object {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method Get
    $workers += $response.worker
}
$uniqueWorkers = ($workers | Select-Object -Unique).Count
Write-Host "[OK] Clustering: $uniqueWorkers workers diferentes" -ForegroundColor Green

# Teste 3: Upload
$testContent = "Linha 1: Teste`nLinha 2: Streams`nLinha 3: Node.js"
$testContent | Out-File -FilePath "test-upload.txt" -Encoding utf8 -NoNewline

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/upload" -Method Post -InFile "test-upload.txt" -ContentType "text/plain"
    Write-Host "[OK] Upload: $($response.filename)" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Upload falhou" -ForegroundColor Red
    $errors++
}

# Teste 4: Upload com Transformacao
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/upload?transform=uppercase" -Method Post -InFile "test-upload.txt" -ContentType "text/plain"
    Write-Host "[OK] Transformacao: $($response.stats.charCount) caracteres -> $($response.filename)" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Transformacao falhou" -ForegroundColor Red
    $errors++
}

# Teste 5: Processamento CPU
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/process?task=heavyComputation&n=5000000" -Method Get
    Write-Host "[OK] CPU: $($response.totalDuration)ms" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Processamento CPU falhou" -ForegroundColor Red
    $errors++
}

# Teste 6: Estatisticas
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/process/stats" -Method Get
    Write-Host "[OK] Estatisticas: $($stats.stats.availableWorkers)/$($stats.stats.totalWorkers) workers disponiveis" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] Estatisticas falharam" -ForegroundColor Red
    $errors++
}

# Limpeza
if (Test-Path "test-upload.txt") {
    Remove-Item "test-upload.txt" -ErrorAction SilentlyContinue
}

Write-Host "=== Concluido ($errors erros) ===" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Yellow" })
