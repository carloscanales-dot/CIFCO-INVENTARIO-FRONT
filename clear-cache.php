<?php
// Forzar limpieza de caché y verificación
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: text/html; charset=utf-8');

// Verificar si PHP tiene OPCache habilitado y resetearlo
if (function_exists('opcache_reset')) {
    opcache_reset();
    $opcache = "✓ OPCache limpiado";
} else {
    $opcache = "✗ OPCache no disponible";
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>Limpieza de Caché - CIFCO Inventario</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #31395c; }
        .success { color: #28a745; font-weight: bold; }
        .error { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .info { color: #17a2b8; }
        .divider { border-top: 2px solid #eee; margin: 20px 0; }
        button {
            background: #31395c;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover {
            background: #1e2538;
        }
        .instructions {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Limpieza de Caché - CIFCO Inventario</h1>
        
        <div class="divider"></div>
        
        <h2>Estado del Servidor:</h2>
        <ul>
            <li><?php echo $opcache; ?></li>
            <li class="success">✓ Headers de no-cache enviados</li>
            <li class="info">Timestamp: <?php echo date('Y-m-d H:i:s'); ?></li>
        </ul>
        
        <div class="divider"></div>
        
        <div class="instructions">
            <h3>⚠️ Instrucciones Importantes:</h3>
            <ol>
                <li><strong>Limpia la caché de tu navegador</strong> (Ctrl + Shift + Del)</li>
                <li><strong>Cierra todas las pestañas</strong> de inventario.cifco.gob.sv</li>
                <li><strong>Abre en modo incógnito</strong> para probar</li>
                <li><strong>Accede directamente a:</strong> <a href="https://inventario.cifco.gob.sv/dashboard">https://inventario.cifco.gob.sv/dashboard</a></li>
            </ol>
        </div>
        
        <div class="divider"></div>
        
        <h2>Acciones:</h2>
        <button onclick="window.location.href='/'">Ir a Inicio</button>
        <button onclick="window.location.href='/login'">Ir a Login</button>
        <button onclick="window.location.href='/dashboard'">Ir a Dashboard</button>
        <button onclick="location.reload(true)">Recargar Hard</button>
        
        <div class="divider"></div>
        
        <h2>Verificación de Archivos:</h2>
        <ul>
            <li class="<?php echo file_exists('.htaccess') ? 'success' : 'error'; ?>">
                .htaccess: <?php echo file_exists('.htaccess') ? '✓ Existe ('.filesize('.htaccess').' bytes)' : '✗ NO EXISTE'; ?>
            </li>
            <li class="<?php echo file_exists('index.html') ? 'success' : 'error'; ?>">
                index.html: <?php echo file_exists('index.html') ? '✓ Existe' : '✗ NO EXISTE'; ?>
            </li>
            <li class="<?php echo is_dir('assets') ? 'success' : 'error'; ?>">
                assets/: <?php echo is_dir('assets') ? '✓ Existe ('.count(glob('assets/*.js')).' archivos JS)' : '✗ NO EXISTE'; ?>
            </li>
        </ul>
        
        <div class="divider"></div>
        
        <p class="info">
            <strong>Si el problema persiste:</strong><br>
            1. Verifica que el .htaccess se subió correctamente<br>
            2. Contacta a soporte de InMotion para limpiar caché del servidor<br>
            3. Pide que verifiquen que AllowOverride All está habilitado
        </p>
    </div>
    
    <script>
        // Forzar recarga sin caché
        if (performance.navigation.type !== 1) {
            console.log('Forzando recarga sin caché...');
        }
    </script>
</body>
</html>
