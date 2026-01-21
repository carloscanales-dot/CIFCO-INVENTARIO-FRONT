export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60
export const PERMISOS = [
    {
        'name': 'Dashboard',
        'permisos': [
            {
                name: 'Graficos',
                permiso: 'dashboard',
            },
        ]
    },
    {
        'name': 'Roles',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_role',
            },
            {
                name: 'Listado',
                permiso: 'list_role',
            },
            {
                name: 'Editar',
                permiso: 'edit_role',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_role',
            }
        ]
    },
    {
        'name': 'Usuarios',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_user',
            },
            {
                name: 'Listado',
                permiso: 'list_user',
            },
            {
                name: 'Editar',
                permiso: 'edit_user',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_user',
            },
        ]
    },
    {
        'name': 'Configuraciones',
        'permisos': [
            {
                name: 'Disponible',
                permiso: 'settings',
            },
        ]
    },
    {
        'name': 'Productos',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_product',
            },
            {
                name: 'Listado',
                permiso: 'list_product',
            },
            {
                name: 'Editar',
                permiso: 'edit_product',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_product',
            },
            {
                name: 'Ver Existencias',
                permiso: 'show_inventory_product',
            },
        ]
    },
    {
        'name': 'Solicitantes',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_client',
            },
            {
                name: 'Listado',
                permiso: 'list_client',
            },
            {
                name: 'Editar',
                permiso: 'edit_client',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_client',
            },
        ]
    },
    {
        'name': 'Salidas',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_dispatch',
            },
            {
                name: 'Listado',
                permiso: 'list_dispatch',
            },
            {
                name: 'Editar',
                permiso: 'edit_dispatch',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_dispatch',
            },
        ]
    },
    {
        'name': 'Entradas',
        'permisos': [
            {
                name: 'Registrar',
                permiso: 'register_purchase',
            },
            {
                name: 'Listado',
                permiso: 'list_purchase',
            },

            {
                name: 'Editar',
                permiso: 'edit_purchase',
            },
            {
                name: 'Eliminar',
                permiso: 'delete_purchase',
            },
        ]
    },
    {
        'name': 'Conversiones',
        'permisos': [
            {
                name: 'Disponible',
                permiso: 'conversions',
            },
        ]
    },
    {
        'name': 'Kardex',
        'permisos': [
            {
                name: 'Disponible',
                permiso: 'kardex',
            },
        ]
    },
];

/**
 * Verifica si el usuario tiene un permiso específico
 * Esta función se mantiene por compatibilidad con código existente
 * Se recomienda usar usePermissions() composable para nuevos componentes
 */
export function isPermission(permission) {
    // Si no se proporciona permiso o es 'all', retornar true
    if (!permission || permission === 'all') {
        return true;
    }

    let USER = localStorage.getItem("user") ? JSON.parse(localStorage.getItem('user')) : null;
    
    if (!USER) {
        return false;
    }

    // Super-Admin tiene todos los permisos
    if (USER.role && USER.role.name === 'Super-Admin') {
        return true;
    }

    // Verificar si el usuario tiene el permiso
    const permissions = USER.permissions || [];
    return permissions.includes(permission);
}
  