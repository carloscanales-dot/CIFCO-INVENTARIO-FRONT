# Recomendaciones para el Backend - Sistema de Permisos

## ⚠️ IMPORTANTE: La Seguridad no Debe Depender Solo del Frontend

Aunque hemos implementado un sistema robusto de permisos en el frontend, **NUNCA se debe confiar únicamente en las validaciones del frontend para seguridad**. El backend DEBE validar todos los permisos.

## 1. Validación de Permisos en el Backend

### ❌ Problema Actual
El frontend puede ocultar botones y rutas, pero un usuario malicioso podría:
- Hacer peticiones directas a la API usando herramientas como Postman
- Manipular el localStorage para cambiar sus permisos
- Modificar el código JavaScript en el navegador

### ✅ Solución Requerida
El backend debe validar TODOS los permisos en cada endpoint:

```php
// Ejemplo en Laravel (PHP)

// Middleware para verificar permisos
public function handle($request, Closure $next, $permission)
{
    if (!auth()->user()->hasPermission($permission)) {
        return response()->json([
            'error' => 'No tienes permiso para realizar esta acción',
            'required_permission' => $permission
        ], 403);
    }
    
    return $next($request);
}

// Uso en rutas
Route::middleware(['auth', 'permission:list_product'])
    ->get('/api/products', [ProductController::class, 'index']);

Route::middleware(['auth', 'permission:edit_product'])
    ->put('/api/products/{id}', [ProductController::class, 'update']);

Route::middleware(['auth', 'permission:delete_product'])
    ->delete('/api/products/{id}', [ProductController::class, 'destroy']);
```

## 2. Estructura Recomendada para Respuestas del Backend

### Login Response
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "full_name": "Juan Pérez",
      "email": "juan@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "sucursale_id": 2,
      "sucursale": {
        "id": 2,
        "name": "Ilopango"
      },
      "role": {
        "id": 2,
        "name": "Administrador de Sucursales"
      },
      "permissions": [
        "dashboard",
        "settings",
        "register_product",
        "list_product",
        "edit_product"
      ]
    }
  }
}
```

### Error de Permiso Denegado
```json
{
  "success": false,
  "error": "Permiso denegado",
  "message": "No tienes permiso para realizar esta acción",
  "required_permission": "delete_product",
  "code": 403
}
```

## 3. Validaciones Recomendadas por Endpoint

### GET Endpoints (Lectura)
```
GET /api/products           → Permiso: list_product
GET /api/products/{id}      → Permiso: show_product o list_product
GET /api/roles              → Permiso: list_role
GET /api/users              → Permiso: list_user
```

### POST Endpoints (Creación)
```
POST /api/products          → Permiso: register_product
POST /api/sales             → Permiso: register_sale
POST /api/purchases         → Permiso: register_purchase
POST /api/roles             → Permiso: register_role
```

### PUT/PATCH Endpoints (Actualización)
```
PUT /api/products/{id}      → Permiso: edit_product
PUT /api/sales/{id}         → Permiso: edit_sale
PUT /api/roles/{id}         → Permiso: edit_role
```

### DELETE Endpoints (Eliminación)
```
DELETE /api/products/{id}   → Permiso: delete_product
DELETE /api/roles/{id}      → Permiso: delete_role
DELETE /api/users/{id}      → Permiso: delete_user
```

## 4. Middleware de Validación de Permisos

### Ejemplo de Implementación

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        $user = auth()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'No autenticado',
                'message' => 'Debes iniciar sesión para acceder a este recurso'
            ], 401);
        }
        
        // Super-Admin tiene todos los permisos
        if ($user->role->name === 'Super-Admin') {
            return $next($request);
        }
        
        // Verificar si el usuario tiene al menos uno de los permisos requeridos
        $userPermissions = $user->permissions->pluck('name')->toArray();
        $hasPermission = false;
        
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions)) {
                $hasPermission = true;
                break;
            }
        }
        
        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'error' => 'Permiso denegado',
                'message' => 'No tienes permiso para realizar esta acción',
                'required_permissions' => $permissions,
                'your_permissions' => $userPermissions
            ], 403);
        }
        
        return $next($request);
    }
}
```

## 5. Validación en Controladores

Además del middleware, validar en el controlador:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function destroy($id)
    {
        // Validación adicional en el controlador
        if (!auth()->user()->can('delete_product')) {
            return response()->json([
                'success' => false,
                'error' => 'No tienes permiso para eliminar productos'
            ], 403);
        }
        
        // Validación de lógica de negocio
        $product = Product::findOrFail($id);
        
        // Ejemplo: No permitir eliminar productos con stock
        if ($product->stock > 0) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar un producto con stock disponible'
            ], 422);
        }
        
        $product->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente'
        ]);
    }
}
```

## 6. Rate Limiting y Seguridad Adicional

```php
// En routes/api.php
Route::middleware(['auth', 'throttle:60,1'])
    ->group(function () {
        // 60 peticiones por minuto por usuario autenticado
        Route::get('/products', [ProductController::class, 'index']);
    });

Route::middleware(['auth', 'throttle:10,1'])
    ->group(function () {
        // 10 peticiones por minuto para operaciones sensibles
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
    });
```

## 7. Logging de Acciones Sensibles

```php
public function destroy($id)
{
    $product = Product::findOrFail($id);
    
    // Log de la acción
    Log::info('Product deletion attempt', [
        'user_id' => auth()->id(),
        'user_email' => auth()->user()->email,
        'product_id' => $id,
        'product_name' => $product->name,
        'timestamp' => now(),
        'ip_address' => request()->ip()
    ]);
    
    // Si no tiene permiso
    if (!auth()->user()->can('delete_product')) {
        Log::warning('Unauthorized product deletion attempt', [
            'user_id' => auth()->id(),
            'product_id' => $id
        ]);
        
        return response()->json(['error' => 'Permiso denegado'], 403);
    }
    
    $product->delete();
    
    return response()->json(['success' => true]);
}
```

## 8. Validación de Permisos en Queries

```php
// Filtrar resultados según permisos del usuario
public function index(Request $request)
{
    $user = auth()->user();
    
    // Super-Admin ve todos los productos
    if ($user->role->name === 'Super-Admin') {
        $products = Product::all();
    } 
    // Administrador de Sucursal solo ve productos de su sucursal
    else if ($user->hasPermission('list_product')) {
        $products = Product::where('sucursale_id', $user->sucursale_id)->get();
    } 
    else {
        return response()->json([
            'error' => 'No tienes permiso para ver productos'
        ], 403);
    }
    
    return response()->json([
        'success' => true,
        'products' => $products
    ]);
}
```

## 9. Refresh de Permisos

El backend debe proporcionar un endpoint para refrescar los permisos del usuario:

```php
// GET /api/auth/me
public function me(Request $request)
{
    $user = auth()->user();
    $user->load(['role', 'sucursale', 'permissions']);
    
    return response()->json([
        'success' => true,
        'user' => [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'sucursale_id' => $user->sucursale_id,
            'sucursale' => $user->sucursale,
            'role' => $user->role,
            'permissions' => $user->permissions->pluck('name')
        ]
    ]);
}
```

Frontend puede llamar esto después de login o periódicamente:

```javascript
// Refresh user data
const refreshUserData = async () => {
  try {
    const response = await $api('/auth/me', { method: 'GET' })
    localStorage.setItem('user', JSON.stringify(response.user))
    return response.user
  } catch (error) {
    console.error('Error refreshing user data:', error)
    // Si el token expiró, redirigir a login
    if (error.statusCode === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      await router.push('/login')
    }
  }
}
```

## 10. Checklist de Seguridad Backend

- [ ] Todos los endpoints tienen middleware de autenticación
- [ ] Todos los endpoints protegidos validan permisos específicos
- [ ] Los Super-Admin tienen bypass automático de permisos
- [ ] Respuestas consistentes con códigos HTTP correctos (401, 403, 422)
- [ ] Rate limiting implementado en endpoints sensibles
- [ ] Logging de acciones importantes (creación, edición, eliminación)
- [ ] Validación de permisos en queries (filtrar por sucursal, etc.)
- [ ] Endpoint para refresh de datos de usuario
- [ ] Validación de lógica de negocio además de permisos
- [ ] Tokens con expiración configurada
- [ ] CORS configurado correctamente
- [ ] Sanitización de inputs
- [ ] Validación de tipos de datos

## 11. Códigos HTTP Recomendados

```
200 OK - Operación exitosa
201 Created - Recurso creado exitosamente
204 No Content - Eliminación exitosa

400 Bad Request - Datos inválidos
401 Unauthorized - No autenticado (token inválido/expirado)
403 Forbidden - No autorizado (sin permiso)
404 Not Found - Recurso no encontrado
422 Unprocessable Entity - Validación de negocio falló
429 Too Many Requests - Rate limit excedido

500 Internal Server Error - Error del servidor
```

## Resumen

**El frontend debe ser una experiencia de usuario optimizada, pero la seguridad SIEMPRE debe ser validada en el backend.** 

El sistema de permisos del frontend solo mejora la UX ocultando opciones que el usuario no puede usar, pero no proporciona seguridad real sin validaciones del backend.
