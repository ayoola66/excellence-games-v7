'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { strapiApi } from '@/lib/strapiApi'
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
  TruckIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  PlayIcon as PlaySolid,
  QuestionMarkCircleIcon as QuestionSolid,
  MusicalNoteIcon as MusicSolid,
  UserGroupIcon as UsersSolid,
  ChartBarIcon as ChartSolid,
  CogIcon as CogSolid,
  ShoppingBagIcon as ShopSolid
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  totalQuestions: number
  categories?: any[]
  createdAt: string
  updatedAt: string
  thumbnail: any
  isActive: boolean
  sortOrder: number
  accessType?: string
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
  const { admin, adminLogout, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [games, setGames] = useState<Game[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showGameForm, setShowGameForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' as 'danger' | 'warning' | 'info' | 'success',
    action: () => {},
    loading: false
  })

  // Form states
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    type: 'straight' as 'straight' | 'nested',
    status: 'free' as 'free' | 'premium',
    categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
    thumbnail: null as File | null
  })

  const [questionForm, setQuestionForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 'option1' as 'option1' | 'option2' | 'option3' | 'option4',
    explanation: '',
    category: '',
    game: ''
  })

  const [uploadingGame, setUploadingGame] = useState(false)
  const [xlsxFile, setXlsxFile] = useState<File | null>(null)
  const [refreshingGames, setRefreshingGames] = useState(false)

  // Shop state
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    salePrice: 0,
    type: 'board_game' as Product['type'],
    sku: '',
    stock: 0,
    category: '',
    isActive: true,
    isFeatured: false,
    grantsPremiumAccess: false,
    premiumDurationMonths: 12,
    images: [] as File[]
  })
  const [uploadingProduct, setUploadingProduct] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin')
    }
  }, [admin, isLoading, router])

  useEffect(() => {
    if (admin) {
      fetchData()
    }
  }, [admin])

  // Update stats when games or questions change
  useEffect(() => {
    if (games.length > 0 || questions.length > 0) {
      fetchStats()
    }
  }, [games, questions])

  // Initialize shop data when tab is accessed
  useEffect(() => {
    if (activeTab === 'shop' && products.length === 0 && orders.length === 0) {
      fetchProducts()
      fetchOrders()
    }
  }, [activeTab])

  const fetchData = async () => {
    try {
      // Fetch games and questions (stats will be updated by useEffect)
      await Promise.all([
        fetchGames(),
        fetchQuestions()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchGames = async () => {
    try {
      setRefreshingGames(true)
      const response = await strapiApi.getGames()
      setGames(response.data || [])
      console.log('🎮 Games fetched:', response.data?.length || 0)
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    } finally {
      setRefreshingGames(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await strapiApi.getQuestions()
      setQuestions(response.data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to load questions')
    }
  }

  const fetchStats = async () => {
    try {
      // Get counts from the actual data since we have the games and questions
      const gamesCount = games.length
      const questionsCount = questions.length
      
      // Try to get users data
      let usersCount = 0
      let premiumUsersCount = 0
      
      try {
        const usersResponse = await strapiApi.getUsersList()
        if (usersResponse?.data) {
          usersCount = usersResponse.data.length
          premiumUsersCount = usersResponse.data.filter((user: any) => 
            user.subscriptionStatus === 'premium'
          ).length
        }
      } catch (userError) {
        console.log('Could not fetch users data:', userError)
      }
      
      setStats({
        totalGames: gamesCount,
        totalQuestions: questionsCount,
        totalUsers: usersCount,
        premiumUsers: premiumUsersCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats if there's an error
      setStats({
        totalGames: games.length,
        totalQuestions: questions.length,
        totalUsers: 0,
        premiumUsers: 0
      })
    }
  }

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingGame(true)
    
    try {
      const gameData = {
        name: gameForm.name,
        description: gameForm.description,
        type: gameForm.type,
        status: gameForm.status
        // Note: categories are managed separately, not through game updates
      }
      
      if (selectedGame) {
        // Update existing game
        if (gameForm.thumbnail) {
          // Has thumbnail - use FormData
          const formData = new FormData()
          formData.append('data', JSON.stringify(gameData))
          formData.append('files.thumbnail', gameForm.thumbnail)
          await strapiApi.updateGame(selectedGame.id, formData)
        } else {
          // No thumbnail - use regular JSON
          await strapiApi.updateGame(selectedGame.id, gameData)
        }
        
        // For nested games, update categories separately if they changed
        if (gameForm.type === 'nested') {
          const originalCategories = selectedGame.categories?.map(c => c.name) || []
          const newCategories = gameForm.categories.slice(0, 5) // Only first 5, excluding Special Card 6
          
          // Check if categories changed (comparing first 5 categories only)
          const categoriesChanged = JSON.stringify(originalCategories.slice(0, 5)) !== JSON.stringify(newCategories)
          
          if (categoriesChanged) {
            console.log('Categories changed, updating them...')
            try {
              await strapiApi.updateGameCategories(selectedGame.id, newCategories)
              console.log('Categories updated successfully')
            } catch (error) {
              console.error('Failed to update categories:', error)
              toast.error('Game updated but failed to update categories')
              return
            }
          }
        }
        
        toast.success(`Game updated successfully! "${gameForm.name}" has been updated with the latest changes.`)
      } else {
        // Create new game
        if (gameForm.type === 'nested') {
          // Use the specialized nested endpoint
          const nestedGameData = {
            name: gameForm.name,
            description: gameForm.description,
            status: gameForm.status,
            categoryNames: gameForm.categories
          }
          await strapiApi.createGame(nestedGameData)
        } else {
          // Straight game
          if (gameForm.thumbnail) {
            // Has thumbnail - use FormData
            const formData = new FormData()
            formData.append('data', JSON.stringify(gameData))
            formData.append('files.thumbnail', gameForm.thumbnail)
            await strapiApi.createGame(formData)
          } else {
            // No thumbnail - use regular JSON
            await strapiApi.createGame({ data: gameData })
          }
        }
        toast.success(`Game created successfully! "${gameForm.name}" is now available in the games library.`)
      }
      
      setShowGameForm(false)
      setSelectedGame(null)
      setGameForm({
        name: '',
        description: '',
        type: 'straight',
        status: 'free',
        categories: ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'],
        thumbnail: null
      })
      
      // Refresh games list to show the new game
      await fetchGames()
      
    } catch (error) {
      console.error('Error saving game:', error)
      toast.error('Failed to save game')
    } finally {
      setUploadingGame(false)
    }
  }

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await strapiApi.updateQuestion(editingQuestion.id, questionForm)
        toast.success(`Question updated successfully! The question has been updated in "${games.find(g => g.id === questionForm.game)?.name || 'the selected game'}".`)
      } else {
        await strapiApi.createQuestion(questionForm)
        toast.success(`Question created successfully! A new question has been added to "${games.find(g => g.id === questionForm.game)?.name || 'the selected game'}".`)
      }
      setShowQuestionForm(false)
      setEditingQuestion(null)
      setQuestionForm({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: 'option1',
        explanation: '',
        category: '',
        game: ''
      })
      fetchQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    }
  }

  const handleDeleteGame = async (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    const gameName = game?.name || 'this game'
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Game',
      message: `Are you absolutely certain you want to delete "${gameName}"?\n\nThis action will permanently remove:\n• The game and all its settings\n• All associated questions and categories\n• All player progress and statistics\n\nThis cannot be undone.`,
      type: 'danger',
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        try {
          await strapiApi.deleteGame(gameId)
          setConfirmDialog({ isOpen: false, title: '', message: '', type: 'warning', action: () => {}, loading: false })
          toast.success(`Game deleted successfully! "${gameName}" has been permanently removed from the system.`)
          fetchGames()
        } catch (error) {
          console.error('Error deleting game:', error)
          toast.error('Failed to delete game. There was an error removing the game. Please try again.')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleDeleteQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    const questionText = question?.attributes.question || 'this question'
    const gameTitle = question?.attributes.game?.data?.attributes?.name || 'Unknown Game'
    const categoryName = question?.attributes.category?.data?.attributes?.name || 'Unknown Category'
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Question',
      message: `Are you sure you want to delete this question?\n\nGame: ${gameTitle}\nCategory: ${categoryName}\nQuestion: "${questionText.substring(0, 100)}${questionText.length > 100 ? '...' : ''}"\n\nThis action cannot be undone.`,
      type: 'danger',
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        try {
          await strapiApi.deleteQuestion(questionId)
          setConfirmDialog({ isOpen: false, title: '', message: '', type: 'warning', action: () => {}, loading: false })
          toast.success('Question deleted successfully! The question has been removed from the game.')
          fetchQuestions()
        } catch (error) {
          console.error('Error deleting question:', error)
          toast.error('Failed to delete question. There was an error removing the question. Please try again.')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleLogout = async () => {
    await adminLogout()
    router.push('/admin')
  }

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: HomeIcon, iconSolid: HomeSolid },
    { id: 'games', name: 'Games', icon: PlayIcon, iconSolid: PlaySolid },
    { id: 'questions', name: 'Questions', icon: QuestionMarkCircleIcon, iconSolid: QuestionSolid },
    { id: 'shop', name: 'Shop', icon: ShoppingBagIcon, iconSolid: ShopSolid },
    { id: 'music', name: 'Music', icon: MusicalNoteIcon, iconSolid: MusicSolid },
    { id: 'users', name: 'Users', icon: UserGroupIcon, iconSolid: UsersSolid },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon, iconSolid: ChartSolid },
    { id: 'settings', name: 'Settings', icon: CogIcon, iconSolid: CogSolid }
  ]

  // Filter questions based on search and selected game
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = searchTerm === '' || 
      question.attributes.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.attributes.option1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.attributes.option2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.attributes.option3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.attributes.option4.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGame = !selectedGame || 
      question.attributes.game?.data?.id === selectedGame.id
    
    return matchesSearch && matchesGame
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const getAdminBadge = () => {
    const email = admin?.email || ''
    if (email.includes('superadmin')) return { text: 'SA', color: 'bg-red-500' }
    if (email.includes('devadmin') || email.includes('dev@')) return { text: 'DEV', color: 'bg-black' }
    if (email.includes('contentadmin') || email.includes('content@')) return { text: 'CT', color: 'bg-purple-500' }
    if (email.includes('shopadmin')) return { text: 'SH', color: 'bg-green-500' }
    if (email.includes('customeradmin')) return { text: 'CS', color: 'bg-orange-500' }
    return { text: 'ADMIN', color: 'bg-blue-500' }
  }

  const adminBadge = getAdminBadge()

  const refreshGames = async () => {
    await fetchGames()
  }

  // Shop functions
  const fetchProducts = async () => {
    try {
      const response = await strapiApi.getProducts()
      setProducts(response.data || [])
      console.log('🛍️ Products fetched:', response.data?.length || 0)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await strapiApi.getOrders()
      setOrders(response.data || [])
      console.log('📦 Orders fetched:', response.data?.length || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingProduct(true)
    
    try {
      const productData = {
        ...productForm,
        features: productForm.type === 'board_game' ? {
          playersMin: 2,
          playersMax: 6,
          ageMin: 8,
          playTime: '30-60 minutes'
        } : {},
        specifications: productForm.type === 'board_game' ? {
          components: 'Game board, cards, dice, tokens',
          dimensions: '30 x 30 x 7 cm',
          weight: '1.2 kg'
        } : {}
      }
      
      if (selectedProduct) {
        // Update existing product
        if (productForm.images.length > 0) {
          // Has new images - use FormData
          const formData = new FormData()
          formData.append('data', JSON.stringify(productData))
          productForm.images.forEach((image, index) => {
            formData.append(`files.images`, image)
          })
          await strapiApi.updateProduct(selectedProduct.id, formData)
        } else {
          // No new images - use regular JSON
          await strapiApi.updateProduct(selectedProduct.id, productData)
        }
        toast.success(`Product updated successfully! "${productForm.name}" has been updated in the shop.`)
      } else {
        // Create new product
        if (productForm.images.length > 0) {
          // Has images - use FormData
          const formData = new FormData()
          formData.append('data', JSON.stringify(productData))
          productForm.images.forEach((image, index) => {
            formData.append(`files.images`, image)
          })
          await strapiApi.createProduct(formData)
        } else {
          // No images - use regular JSON
          await strapiApi.createProduct({ data: productData })
        }
        toast.success(`Product created successfully! "${productForm.name}" is now available in the shop.`)
      }
      
      setShowProductForm(false)
      setSelectedProduct(null)
      setProductForm({
        name: '',
        description: '',
        shortDescription: '',
        price: 0,
        salePrice: 0,
        type: 'board_game',
        sku: '',
        stock: 0,
        category: '',
        isActive: true,
        isFeatured: false,
        grantsPremiumAccess: false,
        premiumDurationMonths: 12,
        images: []
      })
      
      // Refresh products list
      await fetchProducts()
      
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setUploadingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId)
    const productName = product?.name || 'this product'
    const isInStock = product?.stock && product.stock > 0
    
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productName}"?\n\n${isInStock ? `⚠️ Warning: This product has ${product?.stock} items in stock.` : ''}\n\nThis action will:\n• Permanently remove the product from the shop\n• Remove it from all existing carts\n• Hide it from customer view\n\nThis cannot be undone.`,
      type: 'danger',
      action: async () => {
        setConfirmDialog(prev => ({ ...prev, loading: true }))
        try {
          await strapiApi.deleteProduct(productId)
          setConfirmDialog({ isOpen: false, title: '', message: '', type: 'warning', action: () => {}, loading: false })
          toast.success(`Product deleted successfully! "${productName}" has been removed from the shop.`)
          fetchProducts()
        } catch (error) {
          console.error('Error deleting product:', error)
          toast.error('Failed to delete product. There was an error removing the product. Please try again.')
          setConfirmDialog(prev => ({ ...prev, loading: false }))
        }
      },
      loading: false
    })
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, trackingNumber?: string) => {
    try {
      await strapiApi.updateOrderStatus(orderId, status, trackingNumber)
      toast.success('Order status updated successfully!')
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-2">
            <GlobeEuropeAfricaIcon className="h-8 w-8" />
            <h1 className="text-xl font-bold">Elite Games</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center space-x-3">
            <div className={`px-2 py-1 rounded text-xs font-bold text-white ${adminBadge.color}`}>
              {adminBadge.text}
            </div>
            <div>
              <p className="font-medium text-gray-900">Admin Panel</p>
              <p className="text-xs text-gray-600">{admin?.email}</p>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-4">
          {sidebarItems.map((item) => {
            const IconComponent = activeTab === item.id ? item.iconSolid : item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.name}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  Admin Dashboard 🇬🇧
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">Welcome to the Elite Games admin panel</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Games</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalGames || 0}</p>
                      </div>
                      <PlayIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Questions</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalQuestions || 0}</p>
                      </div>
                      <QuestionMarkCircleIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                      </div>
                      <UserGroupIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Premium Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.premiumUsers || 0}</p>
                      </div>
                      <StarIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Games</h3>
                    <div className="space-y-3">
                      {games
                        .filter(game => game && game.name) // Filter out invalid games
                        .slice(0, 5)
                        .map((game) => (
                        <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{game.name || 'Untitled Game'}</p>
                            <p className="text-xs text-gray-500">
                              {(game.type === 'nested' ? 'Card Game' : 'Straight Quiz')} • 
                              {(game.status === 'premium' ? ' Premium' : ' Free')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {game.status === 'premium' && (
                              <StarIcon className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-sm text-gray-500">
                              {game.totalQuestions || 0} questions
                            </span>
                          </div>
                        </div>
                      ))}
                      {games.filter(game => game && game.name).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>No games available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setActiveTab('games')
                          setShowGameForm(true)
                        }}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <span className="font-medium">Create New Game</span>
                        <PlusIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('questions')
                          setShowQuestionForm(true)
                        }}
                        className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <span className="font-medium">Add Question</span>
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('questions')
                          setShowImportModal(true)
                        }}
                        className="w-full flex items-center justify-between p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <span className="font-medium">Import Questions</span>
                        <DocumentArrowUpIcon className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full flex items-center justify-between p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <span className="font-medium">Manage Users</span>
                        <UserGroupIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Games Management</h2>
                    <p className="text-gray-600">
                      Create and manage trivia games • {games.filter(game => game && game.name).length} game{games.filter(game => game && game.name).length !== 1 ? 's' : ''} loaded
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={refreshGames}
                      disabled={refreshingGames}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {refreshingGames ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {refreshingGames ? 'Refreshing...' : 'Refresh Games'}
                    </button>
                    <button
                      onClick={() => setShowGameForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Game
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {refreshingGames && (
                    <div className="col-span-full flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Loading games...</p>
                      </div>
                    </div>
                  )}
                  
                  {!refreshingGames && games
                    .filter(game => game && game.name) // Filter out invalid games
                    .map((game) => {
                      // Extract attributes with defaults for safety
                      const {
                        name = 'Untitled Game',
                        description = 'No description available',
                        type = 'straight',
                        status = 'free',
                        totalQuestions = 0,
                        categories = []
                      } = game || {}

                      return (
                    <motion.div
                      key={game.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="relative">
                        {game.thumbnail ? (
                          <img
                            src={game.thumbnail.url ? `http://localhost:1337${game.thumbnail.url}` : game.thumbnail}
                            alt={name}
                            className="h-40 w-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        {!game.thumbnail && (
                          <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <PlayIcon className="h-12 w-12 text-white" />
                          </div>
                        )}
                        {/* Fallback div for failed image loads */}
                        <div className="hidden h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <PlayIcon className="h-12 w-12 text-white" />
                        </div>
                        {status === 'premium' && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Premium
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                          {name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{type === 'nested' ? 'Card Game' : 'Straight Quiz'}</span>
                          <span>{totalQuestions} questions</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedGame(game)
                              setGameForm({
                                name,
                                description,
                                type,
                                status,
                                categories: categories?.map(c => c.name) || [],
                                thumbnail: null
                              })
                              setShowGameForm(true)
                            }}
                            className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedGame(game)
                              setActiveTab('questions')
                            }}
                            className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Questions
                          </button>
                          
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="bg-red-50 text-red-600 py-2 px-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    )
                  })}
                  {!refreshingGames && games.filter(game => game && game.name).length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <div className="text-gray-500">
                        <PlayIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No games found</p>
                        <p className="text-sm">Create your first game to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'questions' && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Questions Management</h2>
                    <p className="text-gray-600">Add and manage questions for your games</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                      Import XLSX
                    </button>
                    <button
                      onClick={() => setShowQuestionForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Question
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Questions
                      </label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search questions, options..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Game
                      </label>
                      <select
                        value={selectedGame?.id || ''}
                        onChange={(e) => {
                          const gameId = e.target.value
                          const game = games.find(g => g.id === gameId)
                          setSelectedGame(game || null)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Games</option>
                        {games.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.name || 'Untitled Game'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedGame(null)
                        }}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">
                            {question.attributes.question}
                          </h3>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {['option1', 'option2', 'option3', 'option4'].map((option) => (
                              <div 
                                key={option}
                                className={`p-2 rounded-lg text-sm ${
                                  question.attributes.correctAnswer === option
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                <span className="font-medium">{option.toUpperCase()}:</span> {question.attributes[option as keyof typeof question.attributes] as string}
                                {question.attributes.correctAnswer === option && (
                                  <CheckCircleIcon className="h-4 w-4 inline ml-2 text-green-600" />
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Game: {question.attributes.game?.data?.attributes?.name || 'N/A'}</span>
                            <span>Category: {question.attributes.category?.data?.attributes?.name || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingQuestion(question)
                              setQuestionForm({
                                question: question.attributes.question,
                                option1: question.attributes.option1,
                                option2: question.attributes.option2,
                                option3: question.attributes.option3,
                                option4: question.attributes.option4,
                                correctAnswer: question.attributes.correctAnswer,
                                explanation: question.attributes.explanation || '',
                                category: question.attributes.category?.data?.id || '',
                                game: question.attributes.game?.data?.id || ''
                              })
                              setShowQuestionForm(true)
                            }}
                            className="bg-blue-50 text-blue-600 py-1 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-50 text-red-600 py-1 px-3 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-500">
                        <QuestionMarkCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No questions found</p>
                        <p className="text-sm">Add questions or adjust your filters</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop Management</h2>
                    <p className="text-gray-600">Manage products and orders for the Elite Games shop</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        fetchProducts()
                        fetchOrders()
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Data
                    </button>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Shop Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                      </div>
                      <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                      </div>
                      <TruckIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Board Games</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {products.filter(p => p.type === 'board_game').length}
                        </p>
                      </div>
                      <PlayIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">
                          £{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                        </p>
                      </div>
                      <CurrencyPoundIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Products</h3>
                    <button
                      onClick={() => setShowProductForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Product
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{product.shortDescription}</p>
                          </div>
                          <div className="flex space-x-2 ml-3">
                            <button
                              onClick={() => {
                                setSelectedProduct(product)
                                setProductForm({
                                  name: product.name,
                                  description: product.description,
                                  shortDescription: product.shortDescription || '',
                                  price: product.price,
                                  salePrice: product.salePrice || 0,
                                  type: product.type,
                                  sku: product.sku,
                                  stock: product.stock,
                                  category: product.category || '',
                                  isActive: product.isActive,
                                  isFeatured: product.isFeatured,
                                  grantsPremiumAccess: product.grantsPremiumAccess,
                                  premiumDurationMonths: product.premiumDurationMonths,
                                  images: []
                                })
                                setShowProductForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{product.type.replace('_', ' ')}</span>
                          <span className="font-medium text-gray-900">£{product.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <span>Stock: {product.stock}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {products.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No products yet</p>
                        <p className="text-gray-600">Add your first product to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
                  
                  <div className="space-y-4">
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                            <p className="text-sm text-gray-600">
                              {order.user?.email || 'Guest'} • £{order.total} • {order.productDetails.length} items
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {orders.length === 0 && (
                      <div className="text-center py-12">
                        <TruckIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No orders yet</p>
                        <p className="text-gray-600">Orders will appear here when customers make purchases</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Game Form Modal */}
      {showGameForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedGame ? 'Edit Game' : 'Create New Game'}
                </h3>
                <button
                  onClick={() => {
                    setShowGameForm(false)
                    setSelectedGame(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleGameSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Name
                  </label>
                  <input
                    type="text"
                    value={gameForm.name}
                    onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter game name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={gameForm.description}
                    onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter game description"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Thumbnail
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> game thumbnail
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 2MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.size <= 2 * 1024 * 1024) { // 2MB limit
                            setGameForm({ ...gameForm, thumbnail: file })
                          } else if (file) {
                            toast.error('File size must be less than 2MB')
                            e.target.value = ''
                          }
                        }}
                      />
                    </label>
                  </div>
                  {gameForm.thumbnail && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {gameForm.thumbnail.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game Type
                    </label>
                    <select
                      value={gameForm.type}
                      onChange={(e) => setGameForm({ ...gameForm, type: e.target.value as 'straight' | 'nested' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="straight">Straight Quiz</option>
                      <option value="nested">Card Game</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level
                    </label>
                    <select
                      value={gameForm.status}
                      onChange={(e) => setGameForm({ ...gameForm, status: e.target.value as 'free' | 'premium' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                {gameForm.type === 'nested' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Categories (5 required for Card Game)
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Each card will represent one category. Players will roll dice to select categories.
                    </p>
                    <div className="space-y-3">
                      {gameForm.categories.map((category, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <input
                            type="text"
                            value={category}
                            onChange={(e) => {
                              const newCategories = [...gameForm.categories]
                              newCategories[index] = e.target.value
                              setGameForm({ ...gameForm, categories: newCategories })
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`e.g. ${index === 0 ? 'Science' : index === 1 ? 'History' : index === 2 ? 'Geography' : index === 3 ? 'Literature' : 'Sports'}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Choose diverse categories to make the game more engaging
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGameForm(false)
                      setSelectedGame(null)
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploadingGame}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={uploadingGame}
                  >
                    {uploadingGame && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {uploadingGame ? 'Creating...' : (selectedGame ? 'Update Game' : 'Create Game')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* XLSX Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Import Questions from XLSX
                </h3>
                <button
                  onClick={() => {
                    setShowImportModal(false)
                    setXlsxFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!xlsxFile) {
                  toast.error('No file selected')
                  return
                }
                
                if (!selectedGame) {
                  toast.error('Please select a game first')
                  return
                }
                
                try {
                  const fileExtension = xlsxFile.name.split('.').pop()?.toLowerCase()
                  
                  if (fileExtension === 'csv') {
                    // Handle CSV import for straight games
                    if (selectedGame.type !== 'straight') {
                      toast.error('CSV files are only for Straight games. Please use XLSX for Nested games.')
                      return
                    }
                    await strapiApi.importQuestionsCSV(selectedGame.id, '', xlsxFile)
                    toast.success('Questions imported successfully from CSV!')
                  } else if (fileExtension === 'xlsx') {
                    // Handle XLSX import for nested games
                    if (selectedGame.type !== 'nested') {
                      toast.error('XLSX files are only for Nested games. Please use CSV for Straight games.')
                      return
                    }
                    
                    // Create FormData for XLSX file upload
                    const formData = new FormData()
                    formData.append('file', xlsxFile)
                    formData.append('gameId', selectedGame.id)
                    
                    const response = await fetch('/api/admin/import-questions-xlsx', {
                      method: 'POST',
                      body: formData
                    })
                    
                    if (!response.ok) {
                      throw new Error('Import failed')
                    }
                    
                    toast.success('Questions imported successfully from XLSX!')
                  } else {
                    toast.error('Please select a valid CSV or XLSX file')
                    return
                  }
                  
                  setShowImportModal(false)
                  setXlsxFile(null)
                  fetchQuestions() // Refresh questions list
                } catch (error) {
                  console.error('Import error:', error)
                  toast.error('Failed to import questions. Please check your file format.')
                }
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Target Game *
                  </label>
                  <select
                    value={selectedGame?.id || ''}
                    onChange={(e) => {
                      const gameId = e.target.value
                      const game = games.find(g => g.id === gameId)
                      setSelectedGame(game || null)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a game to import questions to...</option>
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name || 'Untitled Game'} ({game.type === 'nested' ? 'Card Game - XLSX' : 'Straight Quiz - CSV'})
                      </option>
                    ))}
                  </select>
                  {selectedGame && (
                    <p className="mt-2 text-sm text-blue-600">
                      Selected: {selectedGame.name} • {selectedGame.type === 'nested' ? 'Upload XLSX file with 5 sheets' : 'Upload CSV file'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV or XLSX File *
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> questions file
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedGame 
                            ? `${selectedGame.type === 'nested' ? 'XLSX file with 5 sheets' : 'CSV file'} for ${selectedGame.name}`
                            : 'CSV for Straight Games, XLSX for Nested Games'
                          }
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setXlsxFile(file)
                          } else {
                            toast.error('No file selected')
                          }
                        }}
                      />
                    </label>
                  </div>
                  {xlsxFile && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {xlsxFile.name}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">📋 Import Format Requirements:</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>
                      <p><strong>For Straight Games (CSV):</strong></p>
                      <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                        Text,Option1,Option2,Option3,Option4,CorrectOption
                      </p>
                      <p className="text-xs mt-1">CorrectOption should be: Option1, Option2, Option3, or Option4</p>
                    </div>
                    
                    <div className="mt-3">
                      <p><strong>For Nested Games (XLSX with 5 sheets):</strong></p>
                      <div className="space-y-1">
                        <p className="text-xs">• <strong>Sheet1:</strong> Category 1 questions (Dice 1/Card 1)</p>
                        <p className="text-xs">• <strong>Sheet2:</strong> Category 2 questions (Dice 2/Card 2)</p>
                        <p className="text-xs">• <strong>Sheet3:</strong> Category 3 questions (Dice 3/Card 3)</p>
                        <p className="text-xs">• <strong>Sheet4:</strong> Category 4 questions (Dice 4/Card 4)</p>
                        <p className="text-xs">• <strong>Sheet5:</strong> Category 5 questions (Dice 5/Card 5)</p>
                      </div>
                      <p className="text-xs mt-2">Each sheet should have columns: Text,Option1,Option2,Option3,Option4,CorrectOption</p>
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Card 6 is special - player can choose any category
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Import Questions
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductForm(false)
                    setSelectedProduct(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed product description"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.salePrice}
                      onChange={(e) => setProductForm({ ...productForm, salePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Type
                    </label>
                    <select
                      value={productForm.type}
                      onChange={(e) => setProductForm({ ...productForm, type: e.target.value as Product['type'] })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="board_game">Board Game</option>
                      <option value="accessory">Accessory</option>
                      <option value="expansion">Expansion</option>
                      <option value="merchandise">Merchandise</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Product category"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isActive}
                      onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.grantsPremiumAccess}
                      onChange={(e) => setProductForm({ ...productForm, grantsPremiumAccess: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Grants Premium Access</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <CloudArrowUpIcon className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> product images
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 2MB each)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          const validFiles = files.filter(file => file.size <= 2 * 1024 * 1024)
                          if (validFiles.length !== files.length) {
                            toast.error('Some files were too large (max 2MB each)')
                          }
                          setProductForm({ ...productForm, images: validFiles })
                        }}
                      />
                    </label>
                  </div>
                  {productForm.images.length > 0 && (
                    <p className="mt-2 text-sm text-green-600">
                      Selected: {productForm.images.length} image(s)
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false)
                      setSelectedProduct(null)
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploadingProduct}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={uploadingProduct}
                  >
                    {uploadingProduct && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {uploadingProduct ? 'Saving...' : (selectedProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => {
                    setShowOrderModal(false)
                    setSelectedOrder(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.email || 'Guest'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Date</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.productDetails.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">£{item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>£{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>£{selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>£{selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>£{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                  <div className="flex space-x-2">
                    {['pending', 'processing', 'shipped', 'delivered'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.status === status
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </h3>
                <button
                  onClick={() => {
                    setShowQuestionForm(false)
                    setEditingQuestion(null)
                    setQuestionForm({
                      question: '',
                      option1: '',
                      option2: '',
                      option3: '',
                      option4: '',
                      correctAnswer: 'option1',
                      explanation: '',
                      category: '',
                      game: ''
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleQuestionSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option 1 *
                    </label>
                    <input
                      type="text"
                      value={questionForm.option1}
                      onChange={(e) => setQuestionForm({ ...questionForm, option1: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First option"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option 2 *
                    </label>
                    <input
                      type="text"
                      value={questionForm.option2}
                      onChange={(e) => setQuestionForm({ ...questionForm, option2: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Second option"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option 3 *
                    </label>
                    <input
                      type="text"
                      value={questionForm.option3}
                      onChange={(e) => setQuestionForm({ ...questionForm, option3: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Third option"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option 4 *
                    </label>
                    <input
                      type="text"
                      value={questionForm.option4}
                      onChange={(e) => setQuestionForm({ ...questionForm, option4: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Fourth option"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value as 'option1' | 'option2' | 'option3' | 'option4' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="option1">Option 1</option>
                    <option value="option2">Option 2</option>
                    <option value="option3">Option 3</option>
                    <option value="option4">Option 4</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Game *
                    </label>
                    <select
                      value={questionForm.game}
                      onChange={(e) => setQuestionForm({ ...questionForm, game: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a game...</option>
                      {games.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name || 'Untitled Game'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Question category (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain why this is the correct answer..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestion(null)
                      setQuestionForm({
                        question: '',
                        option1: '',
                        option2: '',
                        option3: '',
                        option4: '',
                        correctAnswer: 'option1',
                        explanation: '',
                        category: '',
                        game: ''
                      })
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {editingQuestion ? 'Update Question' : 'Create Question'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        loading={confirmDialog.loading}
        confirmText={confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
      />
    </div>
  )
} 