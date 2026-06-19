# Script simple para rebuild con cache limpia

Write-Host ""
Write-Host "LIMPIEZA Y REBUILD - CIFCO Inventario" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Limpiar caches de Vite
Write-Host "[1/8] Limpiando caches de Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Recurse -Force "node_modules/.vite"
    Write-Host "      Cache de Vite eliminado" -ForegroundColor Green
}
if (Test-Path ".vite") {
    Remove-Item -Recurse -Force ".vite"
    Write-Host "      Directorio .vite eliminado" -ForegroundColor Green
}

# Limpiar dist
Write-Host "[2/8] Limpiando directorio dist..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "      Directorio dist eliminado" -ForegroundColor Green
}

# Build
Write-Host "[3/8] Construyendo proyecto..." -ForegroundColor Yellow
pnpm build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Build fallido" -ForegroundColor Red
    exit 1
}
Write-Host "      Build completado" -ForegroundColor Green

# Copiar .htaccess
Write-Host "[4/8] Copiando .htaccess..." -ForegroundColor Yellow
Copy-Item ".htaccess" "dist\.htaccess" -Force
Write-Host "      .htaccess copiado" -ForegroundColor Green

# Actualizar timestamp en .htaccess
Write-Host "[5/8] Agregando timestamp..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$htaccessContent = Get-Content "dist\.htaccess" -Raw
$htaccessContent = "# Actualizado: $timestamp`n$htaccessContent"
Set-Content "dist\.htaccess" -Value $htaccessContent -NoNewline
Write-Host "      Timestamp agregado: $timestamp" -ForegroundColor Green

# Copiar clear-cache.php
Write-Host "[6/8] Copiando clear-cache.php..." -ForegroundColor Yellow
if (Test-Path "clear-cache.php") {
    Copy-Item "clear-cache.php" "dist\clear-cache.php" -Force
    Write-Host "      clear-cache.php copiado" -ForegroundColor Green
}

# Verificar estructura
Write-Host "[7/8] Verificando estructura..." -ForegroundColor Yellow
$jsFiles = (Get-ChildItem -Path "dist\assets\*.js" -File).Count
$cssFiles = (Get-ChildItem -Path "dist\assets\*.css" -File).Count
$indexExists = Test-Path "dist\index.html"
$htaccessExists = Test-Path "dist\.htaccess"

Write-Host "      Archivos JS: $jsFiles" -ForegroundColor Cyan
Write-Host "      Archivos CSS: $cssFiles" -ForegroundColor Cyan
if ($indexExists) {
    Write-Host "      index.html: OK" -ForegroundColor Green
} else {
    Write-Host "      index.html: FALTA" -ForegroundColor Red
}
if ($htaccessExists) {
    Write-Host "      .htaccess: OK" -ForegroundColor Green
} else {
    Write-Host "      .htaccess: FALTA" -ForegroundColor Red
}

# Mostrar primeras lineas de .htaccess
Write-Host "[8/8] Contenido .htaccess (primeras 3 lineas):" -ForegroundColor Yellow
$lines = Get-Content "dist\.htaccess" -TotalCount 3
foreach ($line in $lines) {
    Write-Host "      $line" -ForegroundColor Gray
}

# Resumen final
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "BUILD COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Sube TODA la carpeta 'dist' a InMotion Hosting" -ForegroundColor White
Write-Host "   (Sobrescribe todos los archivos existentes)" -ForegroundColor White
Write-Host ""
Write-Host "2. Accede primero a:" -ForegroundColor White
Write-Host "   https://inventario.cifco.gob.sv/clear-cache.php" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Limpia cache del navegador:" -ForegroundColor White
Write-Host "   Ctrl + Shift + Del" -ForegroundColor White
Write-Host ""
Write-Host "4. Prueba en modo incognito:" -ForegroundColor White
Write-Host "   https://inventario.cifco.gob.sv/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Si todo funciona, prueba desde:" -ForegroundColor White
Write-Host "   https://inventario.cifco.gob.sv/" -ForegroundColor Cyan
Write-Host ""
