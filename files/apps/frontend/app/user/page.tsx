'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { strapiApi } from '@/lib/strapiApi'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  PlayIcon,
  ShoppingBagIcon,
  UserIcon,
  PlusIcon,
  MinusIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  GlobeEuropeAfricaIcon,
  CurrencyPoundIcon,
  TruckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  PlayIcon as PlaySolid,
  ShoppingBagIcon as ShopSolid,
  UserIcon as UserSolid
} from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

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
  isActive: boolean
  isFeatured: boolean
  category?: string
  grantsPremiumAccess: boolean
  premiumDurationMonths: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface Order {
  id: string
  orderNumber: string
  productDetails: any[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  currency: string
  status: string
  paymentStatus: string
  createdAt: string
}

export default function UserDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)

  // Demo products for testing (since backend API is having issues)
  const demoProducts: Product[] = [
    {
      id: '1',
      name: 'Elite Trivia Board Game',
      description: 'The ultimate trivia board game with over 1000 questions across multiple categories. Perfect for family game nights and educational fun. Includes game board, question cards, dice, and player tokens.',
      shortDescription: 'Ultimate trivia board game with 1000+ questions',
      price: 40.00,
      salePrice: 35.00,
      type: 'board_game',
      sku: 'ETG-001',
      stock: 50,
      images: [],
      isActive: true,
      isFeatured: true,
      category: 'Board Games',
      grantsPremiumAccess: true,
      premiumDurationMonths: 12
    },
    {
      id: '2',
      name: 'Additional Game Pack',
      description: 'Expand your trivia experience with 500 additional questions covering new categories like Technology, Movies, and Pop Culture.',
      shortDescription: 'Expansion pack with 500 new questions',
      price: 25.00,
      type: 'expansion',
      sku: 'ETG-002',
      stock: 30,
      images: [],
      isActive: true,
      isFeatured: false,
      category: 'Expansions',
      grantsPremiumAccess: false,
      premiumDurationMonths: 0
    },
    {
      id: '3',
      name: 'Premium Dice Set',
      description: 'Beautiful wooden dice set with custom Elite Games branding. Perfect replacement or upgrade for your game.',
      shortDescription: 'Premium wooden dice set',
      price: 15.00,
      type: 'accessory',
      sku: 'ETG-003',
      stock: 100,
      images: [],
      isActive: true,
      isFeatured: false,
      category: 'Accessories',
      grantsPremiumAccess: false,
      premiumDurationMonths: 0
    },
    {
      id: '4',
      name: 'Elite Games T-Shirt',
      description: 'Show your love for Elite Games with this comfortable cotton t-shirt featuring our logo.',
      shortDescription: 'Comfortable cotton t-shirt with logo',
      price: 20.00,
      type: 'merchandise',
      sku: 'ETG-004',
      stock: 25,
      images: [],
      isActive: true,
      isFeatured: false,
      category: 'Merchandise',
      grantsPremiumAccess: false,
      premiumDurationMonths: 0
    }
  ]

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/landing')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      // Try to fetch real products, fall back to demo data
      const response = await strapiApi.getProducts()
      if (response.data && response.data.length > 0) {
        setProducts(response.data)
      } else {
        setProducts(demoProducts)
      }
      
      // Fetch user orders
      try {
        const ordersResponse = await strapiApi.getUserOrders()
        setOrders(ordersResponse.data || [])
      } catch (error) {
        console.log('Could not fetch orders:', error)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setProducts(demoProducts) // Use demo data as fallback
    }
  }

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { product, quantity: 1 }]
      }
    })
    toast.success(`${product.name} added to cart!`)
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const calculatePricing = () => {
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price
      return sum + (price * item.quantity)
    }, 0)
    
    // Apply dynamic pricing: first board game £40, additional £25
    let adjustedSubtotal = 0
    let boardGameCount = 0
    
    cart.forEach(item => {
      const price = item.product.salePrice || item.product.price
      
      if (item.product.type === 'board_game') {
        for (let i = 0; i < item.quantity; i++) {
          if (boardGameCount === 0) {
            adjustedSubtotal += 40.00
          } else {
            adjustedSubtotal += 25.00
          }
          boardGameCount++
        }
      } else {
        adjustedSubtotal += price * item.quantity
      }
    })
    
    const shipping = adjustedSubtotal >= 50 ? 0 : 5.99
    const tax = (adjustedSubtotal + shipping) * 0.20
    const total = adjustedSubtotal + shipping + tax
    
    return {
      subtotal: adjustedSubtotal,
      shipping,
      tax,
      total,
      boardGameCount,
      grantsPremiumAccess: boardGameCount > 0
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    
    setLoading(true)
    try {
      const pricing = calculatePricing()
      
      // Simulate checkout process
      const orderNumber = `EG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      
      // Demo checkout - in real implementation, this would integrate with Stripe
      const demoOrder: Order = {
        id: Date.now().toString(),
        orderNumber,
        productDetails: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          total: (item.product.salePrice || item.product.price) * item.quantity
        })),
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        total: pricing.total,
        currency: 'GBP',
        status: 'processing',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      }
      
      setOrders(prev => [demoOrder, ...prev])
      setCart([])
      setShowCart(false)
      setShowCheckout(false)
      
      if (pricing.grantsPremiumAccess) {
        toast.success('Order placed successfully! Premium access has been granted for 1 year.')
      } else {
        toast.success('Order placed successfully!')
      }
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process order')
    } finally {
      setLoading(false)
    }
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const pricing = calculatePricing()

  const sidebarItems = [
    { id: 'overview', name: 'Dashboard', icon: HomeIcon, iconSolid: HomeSolid },
    { id: 'games', name: 'My Games', icon: PlayIcon, iconSolid: PlaySolid },
    { id: 'shop', name: 'Shop', icon: ShoppingBagIcon, iconSolid: ShopSolid },
    { id: 'profile', name: 'Profile', icon: UserIcon, iconSolid: UserSolid }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
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

        <div className="p-4 bg-green-50 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.subscriptionStatus || 'Free'} Plan</p>
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
                    ? 'bg-green-50 text-green-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.name}
                {item.id === 'shop' && cartItemCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-600 rounded-lg mb-2 hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center">
              <ShoppingBagIcon className="h-5 w-5 mr-3" />
              Cart
            </div>
            {cartItemCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          
          <button
            onClick={logout}
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
                <p className="text-sm font-medium text-gray-900">
                  Welcome back, {user?.fullName || 'User'}! 🇬🇧
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
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Elite Games</h2>
                  <p className="text-gray-600">Your personal gaming dashboard</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Subscription</p>
                        <p className="text-2xl font-bold text-gray-900">{user?.subscriptionStatus || 'Free'}</p>
                      </div>
                      <StarIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                      </div>
                      <TruckIcon className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cart Items</p>
                        <p className="text-2xl font-bold text-gray-900">{cartItemCount}</p>
                      </div>
                      <ShoppingBagIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
                  {orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} • £{order.total.toFixed(2)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <TruckIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet. Visit the shop to get started!</p>
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
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop Elite Games</h2>
                  <p className="text-gray-600">Discover our premium board games and accessories</p>
                </div>

                {/* Pricing Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Special Pricing</h4>
                  <div className="text-sm text-blue-800">
                    <p>• First board game: £40</p>
                    <p>• Additional board games: £25 each</p>
                    <p>• Free shipping on orders over £50</p>
                    <p>• 📢 Board game purchases include 1 year premium access!</p>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <PlayIcon className="h-16 w-16 text-white" />
                        </div>
                        {product.isFeatured && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                              <StarIcon className="h-3 w-3 mr-1" />
                              Featured
                            </div>
                          </div>
                        )}
                        {product.salePrice && (
                          <div className="absolute top-3 left-3">
                            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Sale
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            {product.salePrice ? (
                              <>
                                <span className="text-xl font-bold text-red-600">£{product.salePrice}</span>
                                <span className="text-sm text-gray-500 line-through">£{product.price}</span>
                              </>
                            ) : (
                              <span className="text-xl font-bold text-gray-900">£{product.price}</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{product.stock} in stock</span>
                        </div>

                        {product.grantsPremiumAccess && (
                          <div className="flex items-center text-xs text-green-600 mb-3">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Includes 1 year premium access
                          </div>
                        )}
                        
                        <button
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
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

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {cart.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            £{(item.product.salePrice || item.product.price).toFixed(2)} each
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          
                          <span className="w-8 text-center">{item.quantity}</span>
                          
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Summary */}
                  <div className="border-t pt-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>£{pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>{pricing.shipping === 0 ? 'Free' : `£${pricing.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (20%):</span>
                        <span>£{pricing.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>£{pricing.total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {pricing.grantsPremiumAccess && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">This order includes 1 year premium access!</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        'Checkout'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
                  <p className="text-gray-600">Add some products to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}