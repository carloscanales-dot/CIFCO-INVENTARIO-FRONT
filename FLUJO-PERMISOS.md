# 🔄 Flujo del Sistema de Permisos

## Diagrama de Flujo - Router Guard

```
┌─────────────────────────────────────────────┐
│         Usuario navega a una ruta           │
│              (router.beforeEach)            │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ ¿Es ruta pública?  │
         │ (meta.public)      │
         └────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
       SÍ                  NO
        │                   │
        ▼                   ▼
   ✅ PERMITIR    ┌──────────────────────────┐
   NAVEGACIÓN    │ ¿Es ruta solo para       │
                 │ no autenticados?         │
                 │ (meta.unauthenticatedOnly)│
                 └──────────┬───────────────┘
                            │
                  ┌─────────┴─────────┐
                  │                   │
                 SÍ                  NO
                  │                   │
                  ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ ¿Usuario está    │  │ ¿Usuario está    │
         │ autenticado?     │  │ autenticado?     │
         └────────┬─────────┘  └────────┬─────────┘
                  │                      │
        ┌─────────┴─────────┐  ┌────────┴────────┐
        │                   │  │                 │
       SÍ                  NO SÍ                NO
        │                   │  │                 │
        ▼                   ▼  │                 ▼
   🔄 REDIRIGIR         ✅ PERMITIR          🔄 REDIRIGIR
   A HOME              NAVEGACIÓN          A /login
                                               │
                                               ▼
         ┌────────────────────────────────────────┐
         │ ¿Es la ruta 'not-authorized'?          │
         └────────────┬───────────────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
           SÍ                  NO
            │                   │
            ▼                   ▼
       ✅ PERMITIR    ┌──────────────────────┐
       NAVEGACIÓN    │ ¿Usuario es          │
                     │ Super-Admin?         │
                     └──────────┬───────────┘
                                │
                      ┌─────────┴─────────┐
                      │                   │
                     SÍ                  NO
                      │                   │
                      ▼                   ▼
                 ✅ PERMITIR    ┌──────────────────────┐
                 NAVEGACIÓN    │ ¿Ruta requiere       │
                               │ permiso específico?  │
                               │ (meta.permission)    │
                               └──────────┬───────────┘
                                          │
                                ┌─────────┴─────────┐
                                │                   │
                            NO/ALL                 SÍ
                                │                   │
                                ▼                   ▼
                           ✅ PERMITIR    ┌──────────────────────┐
                           NAVEGACIÓN    │ ¿Usuario tiene       │
                                         │ el permiso?          │
                                         └──────────┬───────────┘
                                                    │
                                          ┌─────────┴─────────┐
                                          │                   │
                                         SÍ                  NO
                                          │                   │
                                          ▼                   ▼
                                     ✅ PERMITIR        🔄 REDIRIGIR
                                     NAVEGACIÓN        A /not-authorized
```

## Flujo de Verificación de Permisos en Templates

```
┌─────────────────────────────────────┐
│  Componente Vue renderiza template │
└─────────────────┬───────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ ¿Elemento tiene    │
         │ v-if/v-can/v-      │
         │ permission?        │
         └────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
       SÍ                  NO
        │                   │
        ▼                   ▼
   ┌─────────────────┐  ✅ MOSTRAR
   │ isPermission()  │  ELEMENTO
   │ o hasPermission()│
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────┐
   │ 1. Obtener usuario  │
   │    de localStorage  │
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │ 2. ¿Usuario existe? │
   └────────┬────────────┘
            │
     ┌──────┴──────┐
     │             │
    SÍ            NO
     │             │
     ▼             ▼
┌─────────┐    ❌ NO MOSTRAR
│ 3. ¿Es  │    ELEMENTO
│ Super-  │
│ Admin?  │
└────┬────┘
     │
  ┌──┴──┐
  │     │
 SÍ    NO
  │     │
  ▼     ▼
✅     ┌────────────────────┐
MOSTRAR│ 4. ¿Permiso = 'all'│
       │    o undefined?    │
       └────────┬───────────┘
                │
          ┌─────┴─────┐
          │           │
         SÍ          NO
          │           │
          ▼           ▼
       ✅         ┌─────────────────────┐
       MOSTRAR    │ 5. ¿Permiso está en │
                  │    lista de usuario?│
                  └─────────┬───────────┘
                            │
                      ┌─────┴─────┐
                      │           │
                     SÍ          NO
                      │           │
                      ▼           ▼
                  ✅ MOSTRAR   ❌ NO MOSTRAR
                  ELEMENTO     ELEMENTO
```

## Flujo de Autenticación Completa

```
┌────────────┐
│   LOGIN    │
└─────┬──────┘
      │
      ▼
┌─────────────────────────┐
│ Usuario ingresa         │
│ email y contraseña      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ POST /api/login         │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Backend valida          │
│ credenciales            │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
VÁLIDAS      INVÁLIDAS
    │             │
    ▼             ▼
┌─────────┐   ❌ ERROR 401
│ Backend │   Mostrar mensaje
│ retorna:│
│ - token │
│ - user  │
│   - role│
│   - perms│
└────┬────┘
     │
     ▼
┌─────────────────────────┐
│ Frontend guarda en      │
│ localStorage:           │
│ - token                 │
│ - user (JSON)           │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Router redirige a       │
│ /dashboard              │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│ Guard verifica:         │
│ 1. Usuario autenticado  │
│ 2. Permisos para ruta   │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     │           │
  TIENE         NO TIENE
  PERMISO       PERMISO
     │           │
     ▼           ▼
✅ ACCESO     🔄 REDIRECT
PERMITIDO     /not-authorized
     │
     ▼
┌─────────────────────────┐
│ Componente se monta     │
│ - Filtra menú según     │
│   permisos              │
│ - Oculta botones sin    │
│   permiso               │
└─────────────────────────┘
```

## Flujo de Menú de Navegación

```
┌────────────────────────┐
│ DefaultLayoutWith      │
│ VerticalNav.vue        │
│ onMounted()            │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Obtener usuario de     │
│ localStorage           │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│ Iterar sobre navItems  │
│ (navigation/vertical)  │
└──────────┬─────────────┘
           │
           ▼
     ┌─────────────┐
     │ Por cada    │
     │ navItem     │
     └──────┬──────┘
            │
            ▼
   ┌────────────────┐
   │ ¿Es Super-     │
   │ Admin?         │
   └────────┬───────┘
            │
      ┌─────┴─────┐
      │           │
     SÍ          NO
      │           │
      ▼           ▼
   ✅ AGREGAR  ┌──────────────┐
   AL MENÚ     │ ¿permission  │
               │ = 'all'?     │
               └──────┬───────┘
                      │
                ┌─────┴─────┐
                │           │
               SÍ          NO
                │           │
                ▼           ▼
             ✅ AGREGAR  ┌──────────────┐
             AL MENÚ     │ ¿Es heading? │
                         └──────┬───────┘
                                │
                          ┌─────┴─────┐
                          │           │
                         SÍ          NO
                          │           │
                          ▼           ▼
                 ┌────────────┐  ┌──────────────┐
                 │ ¿Al menos  │  │ ¿Tiene hijos?│
                 │ 1 permiso  │  │ (children)   │
                 │ coincide?  │  └──────┬───────┘
                 └─────┬──────┘         │
                       │          ┌─────┴─────┐
                 ┌─────┴─────┐    │           │
                 │           │   SÍ          NO
                SÍ          NO    │           │
                 │           │    ▼           ▼
                 ▼           ▼  ┌──────────────┐  ┌──────────────┐
              ✅ AGREGAR  ❌ NO│ Filtrar hijos│  │ ¿Usuario tiene│
              AL MENÚ     AGREGAR│ según       │  │ el permiso?  │
                                │ permisos    │  └──────┬───────┘
                                └──────┬──────┘         │
                                       │          ┌─────┴─────┐
                                       ▼          │           │
                                 ┌──────────┐   SÍ          NO
                                 │ ¿Quedan  │    │           │
                                 │ hijos?   │    ▼           ▼
                                 └────┬─────┘  ✅ AGREGAR  ❌ NO
                                      │        AL MENÚ     AGREGAR
                                ┌─────┴─────┐
                                │           │
                               SÍ          NO
                                │           │
                                ▼           ▼
                             ✅ AGREGAR  ❌ NO
                             AL MENÚ     AGREGAR
```

## Estados de una Ruta

```
┌──────────────────────────────────────────────────────┐
│                  ESTADOS DE RUTA                     │
└──────────────────────────────────────────────────────┘

1️⃣ PÚBLICA
   ┌────────────────────────────────────────┐
   │ definePage({ meta: { public: true } }) │
   └────────────────────────────────────────┘
   ✅ Accesible sin login
   ✅ No valida permisos
   📄 Ejemplos: 404, not-authorized

2️⃣ SOLO NO AUTENTICADOS
   ┌────────────────────────────────────────────────┐
   │ definePage({ meta: {                           │
   │   unauthenticatedOnly: true                    │
   │ }})                                            │
   └────────────────────────────────────────────────┘
   ✅ Solo si NO está logueado
   🔄 Redirige a home si está logueado
   📄 Ejemplos: login, register

3️⃣ CON PERMISO ESPECÍFICO
   ┌────────────────────────────────────────────────┐
   │ definePage({ meta: {                           │
   │   permission: 'list_product'                   │
   │ }})                                            │
   └────────────────────────────────────────────────┘
   ✅ Solo si tiene el permiso
   🔄 Redirige a /not-authorized si no tiene
   📄 Ejemplos: productos, ventas, compras

4️⃣ PARA TODOS AUTENTICADOS
   ┌────────────────────────────────────────────────┐
   │ definePage({ meta: {                           │
   │   permission: 'all'                            │
   │ }})                                            │
   └────────────────────────────────────────────────┘
   ✅ Solo si está logueado
   ✅ No requiere permiso específico
   📄 Ejemplos: dashboard, perfil

5️⃣ SIN META (PROTEGIDA POR DEFECTO)
   ┌────────────────────────────────────────────────┐
   │ definePage({ meta: {} })                       │
   │ o sin definePage                               │
   └────────────────────────────────────────────────┘
   ✅ Solo si está logueado
   ✅ Accesible para cualquier usuario autenticado
```

## Jerarquía de Permisos

```
┌────────────────────────────────────────┐
│         SUPER-ADMIN (Rol)              │
│  ✅ Acceso TOTAL a TODO                │
│  ✅ Bypass de todas las validaciones   │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│      ADMINISTRADOR DE SUCURSAL         │
│  ✅ Permisos específicos de su rol     │
│  ✅ Solo ve/edita datos de su sucursal│
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│         ROLES PERSONALIZADOS           │
│  ✅ Lista específica de permisos       │
│  ❌ No puede hacer más de lo permitido │
└────────────────────────────────────────┘

EJEMPLO DE PERMISOS POR MÓDULO:

📦 PRODUCTOS
   ├── list_product (Ver lista)
   ├── show_product (Ver detalle)
   ├── register_product (Crear)
   ├── edit_product (Editar)
   └── delete_product (Eliminar)

👥 ROLES
   ├── list_role
   ├── register_role
   ├── edit_role
   └── delete_role

💰 VENTAS
   ├── list_sale
   ├── register_sale
   ├── edit_sale
   └── delete_sale

📊 GENERAL
   ├── dashboard (Ver dashboard)
   ├── settings (Configuraciones)
   └── all (Acceso general autenticado)
```

## Sincronización Frontend-Backend

```
┌─────────────┐           ┌─────────────┐
│  FRONTEND   │           │   BACKEND   │
└──────┬──────┘           └──────┬──────┘
       │                         │
       │  1. POST /api/login     │
       │  { email, password }    │
       ├────────────────────────>│
       │                         │
       │                         │ 2. Valida
       │                         │    credenciales
       │                         │
       │  3. Respuesta:          │
       │  { token, user }        │
       │<────────────────────────┤
       │                         │
4. Guarda en                     │
localStorage                     │
       │                         │
       │  5. GET /api/products   │
       │  Header: Bearer token   │
       ├────────────────────────>│
       │                         │
       │                         │ 6. Valida:
       │                         │    - Token válido
       │                         │    - Permiso: list_product
       │                         │
       │  7. Respuesta:          │
       │  { products: [...] }    │
       │  o 403 Forbidden        │
       │<────────────────────────┤
       │                         │

⚠️ IMPORTANTE:
   Frontend: Mejora UX ocultando opciones
   Backend: VERDADERA seguridad validando todo
```
