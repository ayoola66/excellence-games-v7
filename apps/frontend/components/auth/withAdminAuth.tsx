import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAdminPermissions } from '@/hooks/useAdminPermissions'
import type { AdminPermissions } from '@/types/admin'
import { LoadingFallback } from '@/components/ui/LoadingFallback'

interface WithAdminAuthOptions {
  requiredPermissions?: Array<keyof AdminPermissions>
  requiredRoles?: string[]
  requiredSection?: string
}

export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAdminAuthOptions = {}
) {
  return function WithAdminAuthWrapper(props: P) {
    const router = useRouter()
    const { admin, hasAllPermissions, hasAnyPermission, isAnyRole, canAccessSection } = useAdminPermissions()

    useEffect(() => {
      if (!admin) {
        router.replace('/admin/login')
        return
      }

      const { requiredPermissions, requiredRoles, requiredSection } = options

      if (requiredPermissions && !hasAllPermissions(requiredPermissions)) {
        router.replace('/admin/dashboard')
        return
      }

      if (requiredRoles && !isAnyRole(requiredRoles)) {
        router.replace('/admin/dashboard')
        return
      }

      if (requiredSection && !canAccessSection(requiredSection)) {
        router.replace('/admin/dashboard')
        return
      }
    }, [admin, router, hasAllPermissions, hasAnyPermission, isAnyRole, canAccessSection])

    if (!admin) {
      return <LoadingFallback />
    }

    return <WrappedComponent {...props} />
  }
} 