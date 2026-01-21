# Sistema de Permisos - Documentación

## Resumen de Cambios

Se corrigió el sistema de autenticación y permisos para resolver el problema del loop infinito de redirección y mejorar la lógica de validación de permisos.

## Problemas Corregidos

### 1. Loop Infinito de Redirección ✅
**Problema:** La página `/not-authorized` no tenía configuración `meta.public`, causando que el guard intentara validar permisos y redirigiera nuevamente a `/not-authorized`, creando un ciclo infinito.

**Solución:** 
- Se agregó `definePage({ meta: { public: true } })` a la página `not-authorized.vue`
- Se mejoró la lógica del guard para manejar explícitamente esta ruta

### 2. Lógica de Guard Inconsistente ✅
**Problema:** El guard tenía flujos de código que no se ejecutaban correctamente, causando que usuarios sin permisos pudieran ver rutas protegidas.

**Solución:** Se reestructuró completamente el guard con un flujo lógico claro:

```javascript
1. ¿Es ruta pública? → Permitir acceso
2. ¿Es ruta solo para no autenticados? → Redirigir a home si está logueado
3. ¿Usuario no está logueado? → Redirigir a login
4. ¿Es la página not-authorized? → Permitir acceso
5. ¿Usuario es Super-Admin? → Permitir acceso
6. ¿Ruta no requiere permiso específico? → Permitir acceso
7. ¿Usuario tiene el permiso requerido? → Permitir acceso
8. De lo contrario → Redirigir a not-authorized
```

### 3. Verificación de Permisos Mejorada ✅
**Problema:** La función `isPermission()` en `constants.js` no manejaba casos edge como permisos nulos o usuarios sin permisos definidos.

**Solución:**
- Se creó un nuevo composable `usePermissions.js` con validaciones robustas
- Se actualizó `isPermission()` en `constants.js` para manejar casos edge

## Archivos Modificados

### 1. `src/plugins/1.router/guards.js`
- ✅ Reestructuración completa de la lógica del guard
- ✅ Manejo explícito de la ruta `not-authorized`
- ✅ Flujo de validación más claro y predecible
- ✅ Eliminación de código muerto y console.logs innecesarios

### 2. `src/pages/not-authorized.vue`
- ✅ Agregado `definePage({ meta: { public: true } })`
- ✅ Ahora es accesible sin validación de permisos

### 3. `src/utils/constants.js`
- ✅ Mejorada la función `isPermission()`
- ✅ Manejo de casos edge (permission null, user null, permissions undefined)
- ✅ Validación de 'all' como permiso especial

### 4. `src/composables/usePermissions.js` (NUEVO)
- ✅ Composable centralizado para manejo de permisos
- ✅ Funciones útiles: `hasPermission`, `hasAnyPermission`, `hasAllPermissions`
- ✅ Estados reactivos: `isAuthenticated`, `isSuperAdmin`, `userPermissions`
- ✅ Mejor manejo de errores y casos edge

## Configuración de Permisos en Rutas

### Tipos de Rutas

#### 1. Rutas Públicas
No requieren autenticación ni permisos:
```javascript
definePage({ meta: { public: true } })
```
Ejemplos: 404, not-authorized, landing pages

#### 2. Rutas Solo para No Autenticados
Solo accesibles si el usuario NO está logueado:
```javascript
definePage({ meta: { unauthenticatedOnly: true } })
```
Ejemplos: login, register

#### 3. Rutas con Permiso Específico
Requieren un permiso particular:
```javascript
definePage({ meta: { permission: 'list_product' } })
```

#### 4. Rutas Accesibles para Todos los Autenticados
```javascript
definePage({ meta: { permission: 'all' } })
```
Ejemplos: dashboard, perfil de usuario

#### 5. Rutas Sin Meta Permission
Si una ruta no tiene `meta.permission` definido, será accesible para todos los usuarios autenticados.

## Uso del Sistema de Permisos

### En Templates (Ocultar/Mostrar Elementos)

```vue
<template>
  <!-- Mostrar botón solo si tiene permiso -->
  <VBtn v-if="isPermission('register_product')">
    Nuevo Producto
  </VBtn>

  <!-- Mostrar sección solo para admins -->
  <div v-if="isPermission('admin_section')">
    Contenido administrativo
  </div>
</template>
```

### En Script Setup (Lógica Condicional)

```vue
<script setup>
import { isPermission } from '@/utils/constants'

// Verificar permiso antes de ejecutar acción
const handleAction = () => {
  if (!isPermission('edit_product')) {
    console.error('No tienes permiso para editar productos')
    return
  }
  // Ejecutar acción...
}
</script>
```

### Usando el Composable (Recomendado para nuevos componentes)

```vue
<script setup>
import { usePermissions } from '@/composables/usePermissions'

const { 
  hasPermission, 
  hasAnyPermission,
  isSuperAdmin,
  userPermissions 
} = usePermissions()

// Verificar un permiso
if (hasPermission('delete_product')) {
  // ...
}

// Verificar múltiples permisos (OR)
if (hasAnyPermission(['edit_product', 'delete_product'])) {
  // ...
}

// Verificar si es super admin
if (isSuperAdmin.value) {
  // ...
}
</script>
```

## Menú de Navegación

El sistema de navegación en `DefaultLayoutWithVerticalNav.vue` filtra automáticamente los elementos del menú basándose en:

1. **Super-Admin:** Ve todos los elementos
2. **Usuarios normales:** Solo ven elementos con:
   - `permission: 'all'`
   - Permisos que están en su lista de permisos
   - Headings cuyos permisos coinciden con al menos uno de sus permisos
   - Submenús filtrados según sus permisos

## Permisos del Usuario

Los permisos se obtienen del backend en este formato:

```json
{
  "full_name": "NOE ANTONIO DIAZ ZEPEDA",
  "email": "noe.diaz@cifco.gob.sv",
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
```

## Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre verificar permisos en templates** cuando se muestran botones/acciones
   ```vue
   <VBtn v-if="isPermission('delete_role')">Eliminar</VBtn>
   ```

2. **Configurar meta.permission en todas las rutas protegidas**
   ```javascript
   definePage({ meta: { permission: 'list_product' } })
   ```

3. **Usar el composable para lógica compleja**
   ```javascript
   const { hasAnyPermission } = usePermissions()
   ```

4. **Rutas de error siempre públicas**
   ```javascript
   definePage({ meta: { public: true } })
   ```

### ❌ DON'T (No hacer)

1. **No confiar solo en el frontend** - El backend debe validar permisos también
2. **No hardcodear roles** - Usar permisos granulares
3. **No olvidar manejar el caso de usuario no autenticado**
4. **No crear loops de redirección** - not-authorized debe ser público

## Testing

Para probar el sistema:

1. **Crear un usuario con permisos limitados**
2. **Verificar que:**
   - Solo ve las opciones del menú correspondientes
   - No puede acceder a rutas sin permiso (redirige a not-authorized)
   - Los botones sin permiso no se muestran
   - No hay loops de redirección

## Solución de Problemas

### Loop Infinito de Redirección
- Verificar que not-authorized tenga `meta: { public: true }`
- Verificar que no haya lógica que redirija from y to a la misma ruta

### Usuario ve opciones que no debería
- Verificar que el template use `v-if="isPermission('...')"`
- Verificar que el menú esté filtrando correctamente en `DefaultLayoutWithVerticalNav.vue`

### Aplicación se traba al intentar acceder a una ruta
- Verificar console para ver el error exacto
- Verificar que la ruta tenga configurado `meta.permission` correctamente
- Verificar que el backend esté enviando la lista de permisos correctamente

## Notas Adicionales

- El rol **Super-Admin** siempre tiene acceso completo a todo
- Los permisos se almacenan en localStorage en el objeto `user`
- El token de autenticación también se almacena en localStorage
- La navegación se bloquea a nivel de router guard, no solo de UI
