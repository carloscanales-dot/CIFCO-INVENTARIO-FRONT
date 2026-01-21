/**
 * Plugin global para registrar la función isPermission y directivas de permisos
 * de forma que esté disponible en todos los templates sin importar
 */

import { isPermission } from '@/utils/constants'

export default function (app) {
  // Hacer isPermission disponible globalmente en templates
  app.config.globalProperties.isPermission = isPermission
  
  // También proveer como $can para una sintaxis más legible
  app.config.globalProperties.$can = isPermission
  
  /**
   * Directiva v-permission
   * Uso: v-permission="'edit_product'"
   * Oculta el elemento si el usuario no tiene el permiso
   */
  app.directive('permission', {
    mounted(el, binding) {
      const permission = binding.value
      if (!isPermission(permission)) {
        // Remover el elemento del DOM
        el.parentNode?.removeChild(el)
      }
    }
  })
  
  /**
   * Directiva v-can (alias de v-permission)
   * Uso: v-can="'delete_role'"
   */
  app.directive('can', {
    mounted(el, binding) {
      const permission = binding.value
      if (!isPermission(permission)) {
        el.parentNode?.removeChild(el)
      }
    }
  })
  
  /**
   * Directiva v-any-permission
   * Uso: v-any-permission="['edit_product', 'delete_product']"
   * Muestra el elemento si el usuario tiene al menos uno de los permisos
   */
  app.directive('any-permission', {
    mounted(el, binding) {
      const permissions = binding.value
      if (!Array.isArray(permissions)) {
        console.error('v-any-permission requires an array of permissions')
        return
      }
      
      const hasAnyPermission = permissions.some(permission => isPermission(permission))
      if (!hasAnyPermission) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}
