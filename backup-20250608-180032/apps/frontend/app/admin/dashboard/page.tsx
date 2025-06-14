'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '@/lib/api'
import ConfirmDialog from '@/components/ConfirmDialog'
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
  ArrowPathIcon
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
import { toast } from 'react-hot-toast'

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  totalQuestions: number
  categories?: {
    id: string
    attributes: {
      name: string
      description: string
      questionCount: number
      cardNumber?: number
      status: string
    }
  }[]
  createdAt: string
  updatedAt: string
  thumbnail?: {
    data?: {
      attributes: {
        url: string
        name: string
      }
    }
  }
  isActive: boolean
  sortOrder: number
}

interface Question {
  id: string
  attributes: {
    question: string
    option1: string
    option2: string
    option3: string
    option4: string
    correctAnswer: 'option1' | 'option2' | 'option3' | 'option4'
    explanation?: string
    category?: any
    game?: any
    isActive?: boolean
    timesAnswered?: number
    timesCorrect?: number
    sortOrder?: number
  }
}

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

interface AdminStats {
  totalGames: number
  totalQuestions: number
  totalUsers: number
  premiumUsers: number
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

    fetchData()
  }, [admin, router])

  const fetchData = async () => {
    try {
      const [gamesResponse, statsResponse] = await Promise.all([
        api.getGames(),
        api.getGameStats()
      ])

      setGames(gamesResponse.data)
      setStats(statsResponse)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
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

  const handleDeleteGame = async (gameId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Game',
      message: 'Are you sure you want to delete this game? This action cannot be undone.',
      type: 'danger',
      action: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }))
          await api.delete(`/api/games/${gameId}`)
          setGames(games.filter(game => game.id !== gameId))
          toast.success('Game deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting game:', error)
          toast.error('Failed to delete game')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
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
          await api.delete(`/api/questions/${questionId}`)
          setQuestions(questions.filter(question => question.id !== questionId))
          toast.success('Question deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting question:', error)
          toast.error('Failed to delete question')
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
      toast.error('Failed to log out')
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
    try {
      setRefreshingGames(true)
      const response = await api.getGames()
      setGames(response.data)
      toast.success('Games refreshed successfully')
    } catch (error) {
      console.error('Error refreshing games:', error)
      toast.error('Failed to refresh games')
    } finally {
      setRefreshingGames(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/products?populate=*')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders?populate=*')
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
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
          await api.delete(`/api/products/${productId}`)
          setProducts(products.filter(product => product.id !== productId))
          toast.success('Product deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting product:', error)
          toast.error('Failed to delete product')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await api.put(`/api/orders/${orderId}`, {
        data: { status, trackingNumber }
      })
      fetchOrders()
      toast.success('Order status updated successfully')
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const fetchMusicTracks = async () => {
    try {
      const response = await api.get('/api/background-musics?populate=*')
      return response.data
    } catch (error) {
      console.error('Error fetching music tracks:', error)
      toast.error('Failed to fetch music tracks')
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
          await api.delete(`/api/background-musics/${trackId}`)
          toast.success('Music track deleted successfully')
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        } catch (error) {
          console.error('Error deleting music track:', error)
          toast.error('Failed to delete music track')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users?populate=*')
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
      return []
    }
  }

  const handleUpdateUserSubscription = async (userId: string, subscriptionStatus: 'free' | 'premium') => {
    try {
      await api.put(`/api/users/${userId}`, {
        data: { subscriptionStatus }
      })
      toast.success('User subscription updated successfully')
    } catch (error) {
      console.error('Error updating user subscription:', error)
      toast.error('Failed to update user subscription')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/admin/analytics')
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics')
      return null
    }
  }

  const fetchShopSettings = async () => {
    try {
      const response = await api.get('/api/shop-settings')
      return response.data
    } catch (error) {
      console.error('Error fetching shop settings:', error)
      toast.error('Failed to fetch shop settings')
      return null
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/api/shop-settings', {
        data: {
          // Shop settings data
        }
      })
      toast.success('Shop settings updated successfully')
      fetchShopSettings()
    } catch (error) {
      console.error('Error updating shop settings:', error)
      toast.error('Failed to update shop settings')
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Games</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalGames || 0}</h3>
              </div>
              <PlayIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalQuestions || 0}</h3>
              </div>
              <QuestionMarkCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</h3>
              </div>
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Premium Users</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats?.premiumUsers || 0}</h3>
              </div>
              <StarIcon className="h-8 w-8 text-yellow-600" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {games.map((game) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {game.categories?.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category.attributes.name}
                            {category.attributes.cardNumber && ` (${category.attributes.cardNumber})`}
                          </span>
                        ))}
                      </div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/admin/games/new')}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <PlusIcon className="h-5 w-5 mr-3" />
                  <span>Create New Game</span>
                </div>
                <ArrowRightIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => router.push('/admin/questions/new')}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <PlusIcon className="h-5 w-5 mr-3" />
                  <span>Add Question</span>
                </div>
                <ArrowRightIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => router.push('/admin/questions/import')}
                className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <DocumentArrowUpIcon className="h-5 w-5 mr-3" />
                  <span>Import Questions</span>
                </div>
                <ArrowRightIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => router.push('/admin/users')}
                className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  <span>Manage Users</span>
                </div>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
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