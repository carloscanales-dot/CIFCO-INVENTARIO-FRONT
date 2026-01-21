# Solución: Error 403 en Sesiones de Usuarios

## 🔴 Problema
```
GET http://localhost:8000/api/user-sessions?page=1&per_page=15 403 (Forbidden)
Error: "No tienes permisos para acceder a esta información"
```

## 🔍 Diagnóstico

Este es un problema del **BACKEND**. El error 403 significa que el backend está rechazando la petición porque tu usuario no tiene los permisos necesarios.

### Según el Backend:
Los endpoints de sesiones requieren que el usuario tenga uno de estos roles:
- ✅ **Super Admin**
- ✅ **Admin**

## ✅ Soluciones

### Opción 1: Verificar el Rol de tu Usuario Actual

1. Abre la consola del navegador (F12)
2. Ejecuta este comando:
```javascript
JSON.parse(localStorage.getItem('user'))
```

3. Verifica el campo `role.name`. Debe ser "Super Admin" o "Admin"

Si NO tienes uno de estos roles, necesitas:
- Cambiar el rol de tu usuario en el backend
- O iniciar sesión con un usuario que tenga rol de Admin

---

### Opción 2: Modificar los Permisos en el Backend (Recomendado)

Si quieres que más usuarios puedan ver las sesiones, modifica el backend:

**Archivo:** `app/Http/Controllers/UserSessionController.php`

**Cambiar de:**
```php
public function index()
{
    // Verificar que el usuario tenga rol de admin o super admin
    $user = auth()->user();
    if (!in_array($user->role->name, ['Super Admin', 'Admin'])) {
        return response()->json([
            'message' => 'No tienes permisos para acceder a esta información'
        ], 403);
    }
    // ... resto del código
}
```

**A (usando middleware de permisos):**
```php
public function index()
{
    // Ya no verificar roles aquí, usar middleware en routes/api.php
    // ... resto del código
}
```

Y en **routes/api.php**, cambiar:
```php
// De esto (si está así):
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user-sessions', [UserSessionController::class, 'index']);
    Route::get('user-sessions/stats', [UserSessionController::class, 'stats']);
    Route::put('user-sessions/{id}/close', [UserSessionController::class, 'close']);
});

// A esto (con middleware de permisos):
Route::middleware(['auth:sanctum', 'permission:list_user'])->group(function () {
    Route::get('user-sessions', [UserSessionController::class, 'index']);
    Route::get('user-sessions/stats', [UserSessionController::class, 'stats']);
    Route::put('user-sessions/{id}/close', [UserSessionController::class, 'close']);
});
```

---

### Opción 3: Crear un Permiso Específico (Mejor Práctica)

1. **En el backend**, crear un nuevo permiso llamado `view_sessions`
2. Asignarlo a los roles que deben ver las sesiones
3. Modificar el UserSessionController para usar ese permiso
4. **En el frontend**, actualizar el meta de la página:

```javascript
// En src/pages/users/sessions.vue
definePage({ 
  meta: { 
    permission: 'view_sessions', // En lugar de 'list_user'
  } 
});
```

---

## 🚀 Solución Rápida (Para Testing)

Si solo quieres probar rápido, haz una de estas:

### A) Cambiar tu usuario a Admin en la base de datos
```sql
-- Conecta a tu base de datos y ejecuta:
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1)
WHERE email = 'tu-email@example.com';
```

### B) Crear un usuario Admin desde Tinker (Laravel)
```bash
php artisan tinker
```
```php
$adminRole = Role::where('name', 'Admin')->first();
$user = User::where('email', 'tu-email@example.com')->first();
$user->role_id = $adminRole->id;
$user->save();
```

### C) Temporalmente quitar la validación en el backend
En `UserSessionController.php`, comenta la validación:
```php
public function index()
{
    // TEMPORAL: Comentar para testing
    // $user = auth()->user();
    // if (!in_array($user->role->name, ['Super Admin', 'Admin'])) {
    //     return response()->json([
    //         'message' => 'No tienes permisos para acceder a esta información'
    //     ], 403);
    // }
    
    // ... resto del código
}
```

⚠️ **IMPORTANTE:** Esta opción C es solo para testing. NO la uses en producción.

---

## 🔧 Verificación

Después de aplicar la solución, verifica:

1. Cierra sesión y vuelve a iniciar sesión
2. Abre la consola (F12) y verifica:
```javascript
JSON.parse(localStorage.getItem('user')).role.name
```
3. Debería mostrar "Admin" o "Super Admin"
4. Recarga la página de sesiones
5. Deberías ver los datos sin el error 403

---

## 📋 Resumen

**Problema:** Backend rechaza peticiones (403 Forbidden)  
**Causa:** Usuario no tiene rol de Admin/Super Admin  
**Solución:** Cambiar rol del usuario o modificar permisos en el backend

---

¿Cuál solución prefieres implementar?
