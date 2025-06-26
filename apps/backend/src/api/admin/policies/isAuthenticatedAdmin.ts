export default (policyContext, config, { strapi }) => {
  const { user } = policyContext.state

  if (!user) {
    return false
  }

  // Check if user is an admin
  if (!user.isAdmin) {
    return false
  }

  // Check if user has required role
  const hasRequiredRole = user.roles.some(role => 
    ['super_admin', 'dev_admin', 'shop_admin', 'content_admin', 'customer_admin'].includes(role.code)
  )

  if (!hasRequiredRole) {
    return false
  }

  // Check if user has required permissions based on the route
  const { route } = policyContext
  const routePath = route.path

  // Define route-specific permission requirements
  const routePermissions = {
    '/admin/stats': ['viewAnalytics'],
    '/admin/users': ['manageUsers'],
    '/admin/games': ['manageGames'],
    '/admin/questions': ['manageQuestions'],
    '/admin/products': ['manageProducts'],
    '/admin/orders': ['manageOrders']
  }

  const requiredPermissions = routePermissions[routePath]
  if (requiredPermissions) {
    const hasPermissions = requiredPermissions.every(permission => 
      user.permissions.some(p => p.action === permission)
    )
    if (!hasPermissions) {
      return false
    }
  }

  return true
} 