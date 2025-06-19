'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { strapiApi } from '@/lib/strapiApi'
import ConfirmDialog from '@/components/ConfirmDialog'
import QuickActions from '@/components/admin/QuickActions'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  StarIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  GlobeEuropeAfricaIcon,
  ShoppingBagIcon,
  CurrencyPoundIcon,
  TruckIcon,
  ArrowPathIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  PlayIcon as PlayIconSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleIconSolid,
  MusicalNoteIcon as MusicalNoteIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  CurrencyPoundIcon as CurrencyPoundIconSolid,
  TruckIcon as TruckIconSolid
} from '@heroicons/react/24/solid'
import compatToast from '@/lib/notificationManager';
import { Game, Question, Category, AdminStats } from '@/types'

interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  price: number
  salePrice?: number
  type: 'board_game' | 'accessory' | 'expansion' | 'merchandise' | 'other'
  sku: string
  stock: number
  images?: any[]
  features?: any
  specifications?: any
  isActive: boolean
  isFeatured: boolean
  category?: string
  tags?: any
  weight?: number
  dimensions?: any
  grantsPremiumAccess: boolean
  premiumDurationMonths: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  orderNumber: string
  user?: any
  products?: Product[]
  productDetails: any[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
  paymentMethod: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  shippingAddress?: any
  billingAddress?: any
  notes?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  grantedPremiumAccess: boolean
  premiumGrantedAt?: string
  premiumExpiresAt?: string
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const { admin, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [games, setGames] = useState<Game[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [refreshingGames, setRefreshingGames] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info' | 'success'
    action: () => void
    loading: boolean
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: () => {},
    loading: false
  })
  const [isLoading, setIsLoading] = useState(true)

  const sidebarItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      id: 'games',
      name: 'Games',
      icon: PlayIcon,
      iconSolid: PlayIconSolid
    },
    {
      id: 'questions',
      name: 'Questions',
      icon: QuestionMarkCircleIcon,
      iconSolid: QuestionMarkCircleIconSolid
    },
    {
      id: 'music',
      name: 'Music',
      icon: MusicalNoteIcon,
      iconSolid: MusicalNoteIconSolid
    },
    {
      id: 'users',
      name: 'Users',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid
    },
    {
      id: 'products',
      name: 'Products',
      icon: ShoppingBagIcon,
      iconSolid: ShoppingBagIconSolid
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: TruckIcon,
      iconSolid: TruckIconSolid
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: CogIcon,
      iconSolid: CogIconSolid
    }
  ]

  useEffect(() => {
    if (!admin) {
      router.push('/admin/login')
      return
    }

    // Only fetch if we don't have data or if explicitly refreshing
    if (!games.length || refreshingGames) {
      fetchData()
    }
  }, [admin, router]) // Remove games from dependencies to prevent loops

  const fetchData = async () => {
    try {
      const [gamesResponse, questionsResponse, statsResponse] = await Promise.all([
        strapiApi.getAdminGames(),
        strapiApi.getAdminQuestions(),
        strapiApi.getAdminStats()
      ])

      // Create a map of game IDs to question counts
      const questionCountsByGame = questionsResponse.data.reduce((acc: {[key: string]: number}, question: any) => {
        const gameId = question.attributes?.game?.data?.id
        if (gameId) {
          acc[gameId] = (acc[gameId] || 0) + 1
        }
        return acc
      }, {})

      // Map the games data directly from the raw response
      const gamesWithQuestions = gamesResponse.data.map((game: any) => ({
        id: game.id,
        name: game.name,
        description: game.description,
        type: game.type || 'straight',
        status: game.status || 'free',
        isActive: game.isActive ?? true,
        totalQuestions: questionCountsByGame[game.id] || 0,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
        sortOrder: game.sortOrder || 0,
        thumbnail: game.thumbnail?.data?.attributes?.url || null,
        categories: game.categories?.data || []
      }))

      setGames(gamesWithQuestions)
      setStats(statsResponse.data)
      if (refreshingGames) {
        compatToast.success('Games refreshed successfully')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      compatToast.error('Failed to fetch data')
    } finally {
      setIsLoading(false)
      setRefreshingGames(false)
    }
  }

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Game submission logic
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Question submission logic
  }

  const handleDeleteGame = async (id: string) => {
    try {
      await strapiApi.deleteGame(id)
      compatToast.success('Game deleted successfully')
      await fetchData() // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting game:', error)
      compatToast.error('Failed to delete game')
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      type: 'danger',
      action: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }))
          await strapiApi.deleteQuestion(questionId)
          setQuestions(questions.filter(question => question.id !== questionId))
          compatToast.success('Question deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting question:', error)
          compatToast.error('Failed to delete question')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/admin/login')
    } catch (error) {
      console.error('Error logging out:', error)
      compatToast.error('Failed to log out')
    }
  }

  const getAdminBadge = () => {
    return {
      text: 'Super Admin',
      color: 'bg-blue-600'
    }
  }

  const adminBadge = getAdminBadge()

  const refreshGames = async () => {
    setRefreshingGames(true)
    await fetchData()
  }

  const fetchProducts = async () => {
    try {
      const response = await strapiApi.getProducts()
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      compatToast.error('Failed to fetch products')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await strapiApi.getOrders()
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      compatToast.error('Failed to fetch orders')
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Product submission logic
  }

  const handleDeleteProduct = async (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'danger',
      action: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }))
          await strapiApi.deleteProduct(productId)
          setProducts(products.filter(product => product.id !== productId))
          compatToast.success('Product deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting product:', error)
          compatToast.error('Failed to delete product')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await strapiApi.updateOrder(orderId, status, trackingNumber)
      fetchOrders()
      compatToast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
      compatToast.error('Failed to update order status')
    }
  }

  const fetchMusicTracks = async () => {
    try {
      const response = await strapiApi.get('/api/background-musics?populate=*')
      return response.data
    } catch (error) {
      console.error('Error fetching music tracks:', error)
      compatToast.error('Failed to fetch music tracks')
      return []
    }
  }

  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Music submission logic
  }

  const handleDeleteMusic = async (trackId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Music Track',
      message: 'Are you sure you want to delete this music track? This action cannot be undone.',
      type: 'danger',
      action: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }))
          await strapiApi.delete(`/api/background-musics/${trackId}`)
          compatToast.success('Music track deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting music track:', error)
          compatToast.error('Failed to delete music track')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const fetchUsers = async () => {
    try {
      const response = await strapiApi.getAdminUsers()
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      compatToast.error('Failed to fetch users')
      return []
    }
  }

  const handleUpdateUserSubscription = async (userId: string, subscriptionStatus: 'free' | 'premium') => {
    try {
      await strapiApi.updateUserSubscription(userId, subscriptionStatus)
      compatToast.success('User subscription updated successfully')
    } catch (error) {
      console.error('Error updating user subscription:', error)
      compatToast.error('Failed to update user subscription')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await strapiApi.getAnalytics()
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      compatToast.error('Failed to fetch analytics')
      return null
    }
  }

  const fetchShopSettings = async () => {
    try {
      const response = await strapiApi.getShopSettings()
      return response.data
    } catch (error) {
      console.error('Error fetching shop settings:', error)
      compatToast.error('Failed to fetch shop settings')
      return null
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Pass an empty object as settings data
      await strapiApi.updateShopSettings({})
      compatToast.success('Shop settings updated successfully')
      fetchShopSettings()
    } catch (error) {
      console.error('Error updating shop settings:', error)
      compatToast.error('Failed to update shop settings')
    }
  }

  if (!admin) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b-2 border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-xl">
                <HomeIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${adminBadge.color} text-white`}>
                {adminBadge.text}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-blue-800">
            <PlayIcon className="h-12 w-12 text-blue-700 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {stats?.totalGames || 0}
            </div>
            <p className="text-blue-600 font-medium">Total Games</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-yellow-400">
            <QuestionMarkCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {stats?.totalQuestions || 0}
            </div>
            <p className="text-blue-600 font-medium">Total Questions</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-indigo-400">
            <UserGroupIcon className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {stats?.totalUsers || 0}
            </div>
            <p className="text-blue-600 font-medium">Total Users</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center border-l-8 border-green-400">
            <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div className="text-3xl font-bold text-blue-900 mb-2">
              {stats?.premiumUsers || 0}
            </div>
            <p className="text-blue-600 font-medium">Premium Users</p>
          </div>
        </div>
        
        {/* Draft Games Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Draft Games Status</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-amber-800">Nested Games in Draft</h3>
                  <p className="text-sm text-amber-600 mt-1">
                    Nested games need 5 categories with questions to be playable
                  </p>
                </div>
                <div className="text-3xl font-bold text-amber-700">
                  {games.filter(g => g.type === 'nested' && (!g.isActive || !g.categories || g.categories.length < 5)).length}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-800">Straight Games in Draft</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Games that are marked as draft or have no questions
                  </p>
                </div>
                <div className="text-3xl font-bold text-blue-700">
                  {games.filter(g => g.type === 'straight' && (!g.isActive || !g.totalQuestions || g.totalQuestions === 0)).length}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Games */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Games</h2>
            <button
              onClick={refreshGames}
              className="flex items-center text-blue-600 hover:text-blue-800"
              disabled={refreshingGames}
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshingGames ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(games
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                ).map((game) => (
                  <tr key={game.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{game.name}</div>
                      <div className="text-sm text-gray-500">{game.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize text-sm text-gray-900">{game.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        game.status === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {game.status === 'premium' ? (
                          <>
                            <StarIcon className="h-4 w-4 mr-1" />
                            Premium
                          </>
                        ) : (
                          'Free'
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {game.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/games/${game.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <QuickActions />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-700">API Server</span>
                </div>
                <span className="text-green-700 font-medium">Online</span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-700">Database</span>
                </div>
                <span className="text-green-700 font-medium">Connected</span>
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-xl">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-700">File Storage</span>
                </div>
                <span className="text-green-700 font-medium">Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        loading={confirmDialog.loading}
      />
    </div>
  )
} 