
export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
    if (to.meta.public)
      return

    /**
     * Check if user is logged in by checking if token & user data exists in local storage
     */
    const isLoggedIn = !!(localStorage.getItem("token") && localStorage.getItem("user"));
    
    /*
     * If user is logged in and is trying to access login like page, redirect to home
     */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }

    /*
     * If user is not logged in and trying to access protected route, redirect to login
     */
    if (!isLoggedIn) {
      return {
        name: 'login',
        query: {
          ...to.query,
          to: to.fullPath !== '/' ? to.fullPath : undefined,
        },
      }
    }

    /*
     * User is logged in - now check permissions
     * Special routes that don't need permission checks:
     * - not-authorized: error page
     * - Routes with permission: 'all'
     * - Routes without permission meta (should be accessible to all authenticated users)
     */
    
    // Allow access to not-authorized page without permission check
    if (to.name === 'not-authorized') {
      return
    }

    // Get user data
    const USER = JSON.parse(localStorage.getItem("user"));
    
    // Super-Admin has access to everything
    if (USER.role.name === 'Super-Admin') {
      return
    }

    // If route doesn't require specific permission, allow access
    if (!to.meta.permission || to.meta.permission === 'all') {
      return
    }

    // Check if user has the required permission
    const permissions = USER.permissions || [];
    if (permissions.includes(to.meta.permission)) {
      return
    }

    // User doesn't have permission, redirect to not-authorized
    return { name: 'not-authorized' }
  })
}
