# Script para preparar el build para InMotion Hosting (PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "BUILD PARA INMOTION HOSTING" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar dist anterior
Write-Host "1. Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path ".\dist") {
    Remove-Item -Recurse -Force ".\dist"
    Write-Host "   Directorio dist/ eliminado" -ForegroundColor Green
}
Write-Host ""

# 2. Ejecutar build
Write-Host "2. Ejecutando build..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Error en el build" -ForegroundColor Red
    exit 1
}
Write-Host "   Build completado" -ForegroundColor Green
Write-Host ""

# 3. Copiar .htaccess al dist
Write-Host "3. Copiando .htaccess a dist/..." -ForegroundColor Yellow
if (Test-Path ".\.htaccess") {
    Copy-Item ".\.htaccess" ".\dist\.htaccess" -Force
    Write-Host "   .htaccess copiado (sobrescrito)" -ForegroundColor Green
    
    # Verificar que se copió correctamente
    $content = Get-Content ".\dist\.htaccess" -Raw
    if ($content -match "AddType application/javascript") {
        Write-Host "   Configuracion de MIME types confirmada" -ForegroundColor Green
    } else {
        Write-Host "   ADVERTENCIA: El .htaccess puede no tener la configuracion correcta" -ForegroundColor Yellow
    }
} else {
    Write-Host "   .htaccess no encontrado en la raiz del proyecto!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Verificar estructura
Write-Host "4. Verificando estructura final..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path ".\dist\index.html") {
    Write-Host "   index.html" -ForegroundColor Green -NoNewline
    Write-Host " - OK" -ForegroundColor Green
} else {
    Write-Host "   index.html - FALTA" -ForegroundColor Red
}

if (Test-Path ".\dist\.htaccess") {
    Write-Host "   .htaccess" -ForegroundColor Green -NoNewline
    Write-Host " - OK" -ForegroundColor Green
} else {
    Write-Host "   .htaccess - FALTA" -ForegroundColor Red
}

if (Test-Path ".\dist\assets") {
    $jsCount = (Get-ChildItem ".\dist\assets" -Filter "*.js" -Recurse).Count
    $cssCount = (Get-ChildItem ".\dist\assets" -Filter "*.css" -Recurse).Count
    Write-Host "   assets/" -ForegroundColor Green -NoNewline
    Write-Host " - OK ($jsCount JS, $cssCount CSS)" -ForegroundColor Green
} else {
    Write-Host "   assets/ - FALTA" -ForegroundColor Red
}

Write-Host ""

# 5. Mostrar tamaño
Write-Host "5. Tamaño del build:" -ForegroundColor Yellow
$size = (Get-ChildItem ".\dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("   {0:N2} MB" -f $size) -ForegroundColor Cyan
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "BUILD LISTO PARA SUBIR" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pasos siguientes:" -ForegroundColor Yellow
Write-Host "1. Abre tu FTP/SFTP (FileZilla, WinSCP, etc.)" -ForegroundColor White
Write-Host "2. Navega a public_html/ o la carpeta raiz de tu dominio" -ForegroundColor White
Write-Host "3. Sube TODO el contenido de la carpeta dist/" -ForegroundColor White
Write-Host "   (incluyendo .htaccess)" -ForegroundColor White
Write-Host "4. Asegurate de que .htaccess se suba (a veces esta oculto)" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "- El archivo .htaccess DEBE estar en la raiz junto a index.html" -ForegroundColor Red
Write-Host "- Si .htaccess no se ve, habilita 'Mostrar archivos ocultos' en tu cliente FTP" -ForegroundColor Red
