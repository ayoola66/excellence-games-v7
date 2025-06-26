import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { compatToast } from '@/lib/toast'

export function MainNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, admin, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await logout()
      compatToast.success('Successfully logged out')
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      compatToast.error('Failed to log out')
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthenticated = Boolean(user || admin)
  const isAdminRoute = pathname?.startsWith('/admin')
  const isUserRoute = pathname?.startsWith('/user')
  const showAuthButtons = !isAuthenticated && !isAdminRoute

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Elite Games</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {showAuthButtons ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  disabled={isLoading}
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => router.push('/register')}
                  disabled={isLoading}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                >
                  <Avatar
                    name={admin?.username || user?.username || 'User'}
                    src={admin?.avatar || user?.avatar}
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {admin?.fullName || user?.fullName || admin?.username || user?.username}
                  </span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu">
                      {admin ? (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/games"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Manage Games
                          </Link>
                          <Link
                            href="/admin/users"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Manage Users
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/user/games"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            My Games
                          </Link>
                          <Link
                            href="/user/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            Profile Settings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        role="menuitem"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <Spinner className="h-4 w-4 mr-2" />
                            <span>Signing out...</span>
                          </div>
                        ) : (
                          'Sign out'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 