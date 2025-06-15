'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import AuthenticatedMenu from '@/components/AuthenticatedMenu'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

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

  if (!user) {
    return null
  }

  const navigation = [
    { name: 'Dashboard', href: '/user/dashboard' },
    { name: 'My Games', href: '/user/games' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <AuthenticatedMenu />

      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-blue-700 hover:text-blue-900 font-medium">
                  {item.name}
                </Link>
              ))}
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold transition-colours"
            >
              Sign Out
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-16 md:ml-56">
          {children}
        </main>
      </div>
    </div>
  )
} 