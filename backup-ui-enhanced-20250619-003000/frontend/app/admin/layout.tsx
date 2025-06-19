'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  MusicalNoteIcon,
  ShoppingBagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { UserDataProvider } from '@/context/UserDataContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { admin, isLoading, adminLogout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow /admin/login to render without authentication
    if (pathname === '/admin/login') return;
    if (!isLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, isLoading, router, pathname])

  // Allow /admin/login to render its children without auth guard
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Games', href: '/admin/games', icon: PlayIcon },
    { name: 'Questions', href: '/admin/questions', icon: QuestionMarkCircleIcon },
    { name: 'Music', href: '/admin/music', icon: MusicalNoteIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/admin/orders', icon: TruckIcon },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {navigation.slice(0, 4).map((item) => (
              <Link key={item.name} href={item.href} className="text-blue-700 hover:text-blue-900 font-medium">
                {item.name}
              </Link>
            ))}
          </div>
          <button
            onClick={adminLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colours"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Side Navigation */}
      <div className="flex">
        <div className="w-64 bg-white shadow-lg h-[calc(100vh-4rem)] sticky top-16">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-900'
                    } group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-900'
                      } mr-3 h-5 w-5`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <UserDataProvider>
            {children}
          </UserDataProvider>
        </main>
      </div>
    </div>
  )
} 