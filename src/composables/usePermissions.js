/**
 * Composable para manejo centralizado de permisos
 * 
 * Este composable proporciona funciones para verificar permisos de usuario
 * de manera consistente en toda la aplicación
 */

import { computed } from 'vue'

export function usePermissions() {
  /**
   * Obtiene los datos del usuario desde localStorage
   */
  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = computed(() => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'))
  })

  /**
   * Obtiene el usuario actual
   */
  const currentUser = computed(() => getUser())

  /**
   * Verifica si el usuario es Super-Admin
   */
  const isSuperAdmin = computed(() => {
    const user = getUser()
    return user?.role?.name === 'Super-Admin'
  })

  /**
   * Obtiene la lista de permisos del usuario actual
   */
  const userPermissions = computed(() => {
    const user = getUser()
    return user?.permissions || []
  })

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - El permiso a verificar
   * @returns {boolean} - true si el usuario tiene el permiso, false en caso contrario
   */
  const hasPermission = (permission) => {
    // Si no se proporciona permiso o es 'all', retornar true
    if (!permission || permission === 'all') {
      return true
    }

    const user = getUser()
    
    // Si no hay usuario, no tiene permisos
    if (!user) {
      return false
    }

    // Super-Admin tiene todos los permisos
    if (user.role?.name === 'Super-Admin') {
      return true
    }

    // Verificar si el usuario tiene el permiso en su lista
    const permissions = user.permissions || []
    return permissions.includes(permission)
  }

  /**
   * Verifica si el usuario tiene al menos uno de varios permisos
   * @param {string[]} permissionList - Array de permisos a verificar
   * @returns {boolean} - true si el usuario tiene al menos uno de los permisos
   */
  const hasAnyPermission = (permissionList) => {
    if (!Array.isArray(permissionList) || permissionList.length === 0) {
      return false
    }

    return permissionList.some(permission => hasPermission(permission))
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} permissionList - Array de permisos a verificar
   * @returns {boolean} - true si el usuario tiene todos los permisos
   */
  const hasAllPermissions = (permissionList) => {
    if (!Array.isArray(permissionList) || permissionList.length === 0) {
      return false
    }

    return permissionList.every(permission => hasPermission(permission))
  }

  /**
   * Obtiene información de la sucursal del usuario
   */
  const userBranch = computed(() => {
    const user = getUser()
    return user?.sucursale || null
  })

  /**
   * Obtiene el rol del usuario
   */
  const userRole = computed(() => {
    const user = getUser()
    return user?.role || null
  })

  return {
    // Estados
    isAuthenticated,
    currentUser,
    isSuperAdmin,
    userPermissions,
    userBranch,
    userRole,
    
    // Métodos
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUser,
  }
}

/**
 * Función global para usar en templates sin importar el composable
 * Esta es la función que se usa actualmente en la aplicación
 * @param {string} permission - El permiso a verificar
 * @returns {boolean}
 */
export function isPermission(permission) {
  const { hasPermission } = usePermissions()
  return hasPermission(permission)
}
