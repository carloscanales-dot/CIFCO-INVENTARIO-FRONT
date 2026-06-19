# 🚀 Guía de Despliegue en InMotion Hosting

## Problema Original
Después del login, la aplicación mostraba el error:
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"
```

**Causa**: Apache estaba sirviendo `index.html` en lugar de los archivos JavaScript cuando se solicitaban rutas dinámicas de Vue Router.

---

## ✅ Solución Implementada

### 1. Archivo `.htaccess` 
Creado un archivo `.htaccess` que:
- ✅ Configura MIME types correctos para JavaScript (`application/javascript`)
- ✅ Previene que Apache sirva HTML cuando se solicitan archivos JS
- ✅ Maneja Vue Router en modo history correctamente
- ✅ Configura caché para assets estáticos
- ✅ NO cachea `index.html` para reflejar cambios inmediatos

### 2. Script de Build Automatizado
`build-inmotion.ps1` que:
- Limpia el build anterior
- Ejecuta `pnpm run build`
- Copia `.htaccess` a `dist/`
- Verifica la estructura final

---

## 📦 Cómo Desplegar

### Paso 1: Generar el Build
```powershell
# Opción A: Script automático (RECOMENDADO)
.\build-inmotion.ps1

# Opción B: Manual
pnpm run build
Copy-Item .htaccess dist\.htaccess
```

### Paso 2: Verificar el Build
Asegúrate de que `dist/` contenga:
```
dist/
├── index.html
├── .htaccess          ← MUY IMPORTANTE
├── assets/
│   ├── index-[hash].js
│   ├── [otros-archivos].js
│   └── [otros-archivos].css
├── favicon.ico
└── ...
```

### Paso 3: Subir a InMotion Hosting

#### Usando FileZilla / Cliente FTP:

1. **Conecta a tu servidor**
   - Host: `ftp.tudominio.com` o IP del servidor
   - Usuario: tu usuario de InMotion
   - Puerto: 21 (FTP) o 22 (SFTP recomendado)

2. **Navega a la carpeta correcta**
   - Si es el dominio principal: `public_html/`
   - Si es un subdominio: `public_html/subdominio/`

3. **Limpia el contenido anterior** (opcional pero recomendado)
   - Elimina archivos antiguos excepto `.htaccess` si tenías uno previo

4. **Sube el contenido de `dist/`**
   - **IMPORTANTE**: Sube el **contenido** de `dist/`, NO la carpeta `dist/` misma
   - Selecciona todos los archivos dentro de `dist/` y súbelos

5. **Verifica que `.htaccess` se haya subido**
   - En FileZilla: Server > Force showing hidden files
   - Debe aparecer `.htaccess` en la raíz junto a `index.html`

#### Usando cPanel (File Manager):

1. Inicia sesión en cPanel de InMotion
2. Abre "File Manager"
3. Navega a `public_html/`
4. Click en "Upload" y sube todos los archivos de `dist/`
5. O usa "Extract" si subes un ZIP
6. Verifica que `.htaccess` esté presente (habilita "Show Hidden Files")

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar `.htaccess`
Accede por FTP o cPanel y confirma que `.htaccess` existe en:
```
public_html/.htaccess
```

### 2. Probar Archivos JavaScript
Abre en el navegador:
```
https://inventario.cifco.gob.sv/assets/index-[hash].js
```

Debe:
- ✅ Mostrar código JavaScript (no HTML)
- ✅ Content-Type en headers: `application/javascript`

Si muestra HTML, el `.htaccess` no está funcionando.

### 3. Probar el Login
1. Accede a `https://inventario.cifco.gob.sv/login`
2. Ingresa credenciales válidas
3. Debe redirigir correctamente a la página principal
4. NO debe mostrar errores de MIME type en consola

### 4. Probar Vue Router
Accede directamente a:
```
https://inventario.cifco.gob.sv/dispatches/list
```
Debe cargar la página correctamente (no 404).

---

## 🐛 Solución de Problemas

### Error: "Failed to load module script"
**Causa**: `.htaccess` no está presente o no funciona

**Solución**:
1. Verifica que `.htaccess` existe en la raíz
2. Verifica que mod_rewrite está habilitado en Apache (InMotion lo tiene por defecto)
3. Contacta soporte de InMotion si persiste

### Error: Página 404 en rutas directas
**Causa**: Las reglas de rewrite no funcionan

**Solución**:
1. Verifica `.htaccess`
2. Asegúrate de que `RewriteEngine On` está en el archivo
3. Verifica permisos del archivo (644)

### Los cambios no se reflejan
**Causa**: Caché del navegador o CDN

**Solución**:
1. Limpia caché del navegador (Ctrl + Shift + Del)
2. Prueba en modo incógnito
3. Si InMotion tiene CDN/Cache, límpialo desde cPanel

### Error: "Internal Server Error 500"
**Causa**: Error de sintaxis en `.htaccess`

**Solución**:
1. Revisa los logs de error en cPanel > Errors
2. Verifica que no hay caracteres extraños en `.htaccess`
3. Prueba subir el `.htaccess` de nuevo

---

## 📋 Checklist Final

Antes de considerar el despliegue exitoso, verifica:

- [ ] `dist/` contiene `index.html`
- [ ] `dist/` contiene `.htaccess`
- [ ] `dist/assets/` contiene archivos `.js` y `.css`
- [ ] Todos los archivos se subieron a `public_html/`
- [ ] `.htaccess` está en la raíz junto a `index.html`
- [ ] El login funciona y redirige correctamente
- [ ] No hay errores de MIME type en consola
- [ ] Las rutas directas de Vue Router funcionan
- [ ] Los assets se cargan correctamente

---

## 🔄 Proceso para Futuros Despliegues

Cada vez que necesites actualizar:

```powershell
# 1. Generar nuevo build
.\build-inmotion.ps1

# 2. Conectar por FTP/SFTP

# 3. Reemplazar archivos en public_html/
#    - Elimina solo la carpeta assets/ antigua
#    - Sube todo el contenido nuevo de dist/
#    - NO elimines .htaccess si ya funciona

# 4. Verificar en el navegador (modo incógnito)
```

---

## 📞 Soporte InMotion

Si necesitas ayuda con configuración de Apache:
- Chat en vivo: disponible 24/7
- Teléfono: en tu portal de InMotion
- Tickets: desde cPanel

Pide específicamente verificar que:
- `mod_rewrite` está habilitado ✅
- `mod_mime` está habilitado ✅
- `mod_headers` está habilitado ✅

---

## ⚠️ IMPORTANTE

**NO OLVIDES**:
- El archivo `.htaccess` DEBE subirse cada vez
- Debe estar en la raíz (mismo nivel que `index.html`)
- Los clientes FTP pueden ocultarlo por defecto
- Usa SFTP (puerto 22) en lugar de FTP para mayor seguridad
