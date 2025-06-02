'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { strapiApi } from '@/lib/strapiApi'
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  MusicalNoteIcon, 
  CogIcon,
  PlayIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface User {
  id: string
  fullName: string
  email: string
  subscriptionStatus: 'free' | 'premium'
  createdAt: string
  lastActive: string
}

interface Game {
  id: string
  attributes: {
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    totalQuestions: number
    createdAt: string
    categories?: any[]
  }
}

interface MusicTrack {
  id: string
  attributes: {
    name: string
    type: 'background' | 'user'
    isActive: boolean
    createdAt: string
  }
}

interface Category {
  id: string
  attributes: {
    name: string
    description: string
    cardNumber?: number
    questionCount: number
  }
}

export default function AdminPage() {
  const { admin, adminLogin, adminLogout, isLoading } = useAuth()
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(!admin)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [selectedGameCategories, setSelectedGameCategories] = useState<Category[]>([])
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [showGameForm, setShowGameForm] = useState(false)
  const [showMusicUpload, setShowMusicUpload] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form states
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    type: 'straight' as 'straight' | 'nested',
    status: 'free' as 'free' | 'premium'
  })

  const [musicForm, setMusicForm] = useState({
    name: '',
    type: 'background' as 'background' | 'user',
    audioFile: null as File | null
  })

  useEffect(() => {
    if (admin) {
      setShowLogin(false)
      fetchDashboardData()
      fetchUsers()
      fetchGames()
      fetchMusicTracks()
    }
  }, [admin])

  const fetchDashboardData = async () => {
    try {
      const stats = await strapiApi.getDashboardStats()
      setDashboardData(stats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await strapiApi.getUsers()
      setUsers(response.map((user: any) => ({
        id: user.id,
        fullName: user.fullName || user.username,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus || 'free',
        createdAt: new Date(user.createdAt).toLocaleDateString(),
        lastActive: new Date(user.updatedAt).toLocaleDateString()
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  const fetchGames = async () => {
    try {
      const response = await strapiApi.getGames()
      setGames(response.data || [])
    } catch (error) {
      console.error('Error fetching games:', error)
      toast.error('Failed to load games')
    }
  }

  const fetchMusicTracks = async () => {
    try {
      const response = await strapiApi.getMusicTracks()
      setMusicTracks(response.data || [])
    } catch (error) {
      console.error('Error fetching music tracks:', error)
      toast.error('Failed to load music tracks')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    
    try {
      const success = await adminLogin(loginData.email, loginData.password)
      if (success) {
        setShowLogin(false)
        setLoginData({ email: '', password: '' })
      }
    } catch (error) {
      toast.error('Admin login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    await adminLogout()
    setShowLogin(true)
    setDashboardData(null)
  }

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      if (editingGame) {
        // Update existing game
        await strapiApi.updateGame(editingGame.id, gameForm)
        toast.success('Game updated successfully')
      } else {
        // Create new game
        const response = await strapiApi.createGame(gameForm)
        toast.success(`Game created successfully${gameForm.type === 'nested' ? ' with 5 categories + special card' : ''}`)
      }
      
      await fetchGames()
      await fetchDashboardData()
      setShowGameForm(false)
      setEditingGame(null)
      setGameForm({ name: '', description: '', type: 'straight', status: 'free' })
    } catch (error: any) {
      console.error('Error saving game:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to save game')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setGameForm({
      name: game.attributes.name,
      description: game.attributes.description,
      type: game.attributes.type,
      status: game.attributes.status
    })
    setShowGameForm(true)
  }

  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game? This will also delete all associated categories and questions.')) {
      try {
        await strapiApi.deleteGame(gameId)
        toast.success('Game deleted successfully')
        await fetchGames()
        await fetchDashboardData()
      } catch (error: any) {
        console.error('Error deleting game:', error)
        toast.error(error.response?.data?.error?.message || 'Failed to delete game')
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await strapiApi.deleteUser(userId)
        toast.success('User deleted successfully')
        await fetchUsers()
        await fetchDashboardData()
      } catch (error: any) {
        console.error('Error deleting user:', error)
        toast.error(error.response?.data?.error?.message || 'Failed to delete user')
      }
    }
  }

  const handleMusicUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    
    try {
      if (!musicForm.audioFile) {
        toast.error('Please select an audio file')
        return
      }

      await strapiApi.uploadMusicTrack({
        name: musicForm.name,
        type: musicForm.type,
        audioFile: musicForm.audioFile
      })
      
      toast.success('Music track uploaded successfully')
      await fetchMusicTracks()
      await fetchDashboardData()
      setShowMusicUpload(false)
      setMusicForm({ name: '', type: 'background', audioFile: null })
    } catch (error: any) {
      console.error('Error uploading music:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to upload music track')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteMusicTrack = async (trackId: string) => {
    if (confirm('Are you sure you want to delete this music track?')) {
      try {
        await strapiApi.deleteMusicTrack(trackId)
        toast.success('Music track deleted successfully')
        await fetchMusicTracks()
        await fetchDashboardData()
      } catch (error: any) {
        console.error('Error deleting music track:', error)
        toast.error(error.response?.data?.error?.message || 'Failed to delete music track')
      }
    }
  }

  const handleViewGameCategories = async (gameId: string) => {
    try {
      setSelectedGameId(gameId)
      const response = await strapiApi.getCategories(gameId)
      setSelectedGameCategories(response.data || [])
      setShowCategoriesModal(true)
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load game categories')
    }
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: HomeIcon },
    { key: 'games', label: 'Games', icon: PlayIcon },
    { key: 'users', label: 'Users', icon: UserGroupIcon },
    { key: 'music', label: 'Music', icon: MusicalNoteIcon },
    { key: 'settings', label: 'Settings', icon: CogIcon },
  ]

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredGames = games.filter(game =>
    game.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMusicTracks = musicTracks.filter(track =>
    track.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <LockClosedIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-600">Secure access for authorised personnel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@elitegames.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                loginLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-800 hover:bg-blue-900 text-white hover:shadow-lg'
              }`}
            >
              {loginLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Super Admin:</strong> superadmin@targetedgames.com / SuperAdmin2024!</p>
              <p><strong>Dev Admin:</strong> devadmin@targetedgames.com / DevAdmin2024!</p>
              <p><strong>Content Admin:</strong> contentadmin@targetedgames.com / ContentAdmin2024!</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-700 hover:text-blue-500 text-sm font-medium"
            >
              &larr; Back to Main Site
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white shadow-lg min-h-screen py-8 px-4">
        <div className="flex items-center mb-10">
          <CogIcon className="h-8 w-8 text-yellow-400 mr-3" />
          <span className="text-2xl font-bold tracking-wide">Admin</span>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-colors duration-150 ${
                activeTab === item.key
                  ? 'bg-yellow-400 text-blue-900 shadow'
                  : 'hover:bg-blue-800 hover:text-yellow-300'
              }`}
            >
              <item.icon className="h-6 w-6" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-yellow-200 font-semibold shadow"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 md:p-12">
        {/* Header for mobile */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-blue-900 focus:outline-none"
          >
            <CogIcon className="h-8 w-8" />
          </button>
          <span className="text-xl font-bold text-blue-900">Admin Dashboard</span>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <section>
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-blue-800">
                <div className="flex items-center gap-4 mb-4">
                  <PlayIcon className="h-10 w-10 text-blue-700" />
                  <span className="text-xl font-semibold text-blue-900">Games</span>
                </div>
                <div className="text-4xl font-bold text-blue-900 mb-2">{dashboardData.games.total}</div>
                <div className="text-sm text-gray-600">{dashboardData.games.free} free, {dashboardData.games.premium} premium</div>
                <div className="text-xs text-gray-400 mt-2">{dashboardData.games.totalQuestions} total questions</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-yellow-400">
                <div className="flex items-center gap-4 mb-4">
                  <UserGroupIcon className="h-10 w-10 text-yellow-500" />
                  <span className="text-xl font-semibold text-blue-900">Users</span>
                </div>
                <div className="text-4xl font-bold text-blue-900 mb-2">{dashboardData.users.total}</div>
                <div className="text-sm text-gray-600">{dashboardData.users.premium} premium, {dashboardData.users.free} free</div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border-l-8 border-indigo-400">
                <div className="flex items-center gap-4 mb-4">
                  <MusicalNoteIcon className="h-10 w-10 text-indigo-500" />
                  <span className="text-xl font-semibold text-blue-900">Music</span>
                </div>
                <div className="text-4xl font-bold text-blue-900 mb-2">{dashboardData.music.backgroundTracks + dashboardData.music.userTracks}</div>
                <div className="text-sm text-gray-600">{dashboardData.music.backgroundTracks} background, {dashboardData.music.userTracks} user</div>
                <div className="text-xs text-gray-400 mt-2">{dashboardData.music.activeTracks} active tracks</div>
              </div>
            </div>
          </section>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900">Games Management</h2>
              <button
                onClick={() => setShowGameForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Game
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Games Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Questions</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredGames.map((game) => (
                    <tr key={game.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-blue-900">{game.attributes.name}</div>
                          <div className="text-sm text-gray-600">{game.attributes.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          game.attributes.type === 'straight' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {game.attributes.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          game.attributes.status === 'free' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {game.attributes.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{game.attributes.totalQuestions}</td>
                      <td className="px-6 py-4 text-gray-600">{game.attributes.createdAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {game.attributes.type === 'nested' && (
                            <button
                              onClick={() => handleViewGameCategories(game.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                              title="View Categories"
                            >
                              <FolderIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditGame(game)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Game Form Modal */}
            {showGameForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                  <h3 className="text-2xl font-bold text-blue-900 mb-6">
                    {editingGame ? 'Edit Game' : 'Add New Game'}
                  </h3>
                  <form onSubmit={handleGameSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={gameForm.name}
                        onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={gameForm.description}
                        onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={gameForm.type}
                          onChange={(e) => setGameForm(prev => ({ ...prev, type: e.target.value as 'straight' | 'nested' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="straight">Straight</option>
                          <option value="nested">Nested</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={gameForm.status}
                          onChange={(e) => setGameForm(prev => ({ ...prev, status: e.target.value as 'free' | 'premium' }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                          formLoading
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-900 text-white hover:bg-blue-800'
                        }`}
                      >
                        {formLoading ? 'Processing...' : `${editingGame ? 'Update' : 'Create'} Game`}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGameForm(false)
                          setEditingGame(null)
                          setGameForm({ name: '', description: '', type: 'straight', status: 'free' })
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Categories Modal */}
            {showCategoriesModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <h3 className="text-2xl font-bold text-blue-900 mb-6">Game Categories</h3>
                  
                  {selectedGameCategories.length > 0 ? (
                    <div className="space-y-4">
                      {selectedGameCategories.map((category, index) => (
                        <div key={category.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-blue-900">
                                {category.attributes.name}
                                {category.attributes.cardNumber && (
                                  <span className="ml-2 text-sm text-gray-500">
                                    (Card {category.attributes.cardNumber})
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600">{category.attributes.description}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Questions: {category.attributes.questionCount}
                              </p>
                            </div>
                            
                            {category.attributes.cardNumber === 6 ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Special Card
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Category {category.attributes.cardNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No categories found for this game.</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowCategoriesModal(false)
                        setSelectedGameCategories([])
                        setSelectedGameId(null)
                      }}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900">User Management</h2>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Subscription</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-left">Last Active</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-blue-900">{user.fullName}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.subscriptionStatus === 'premium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.createdAt}</td>
                      <td className="px-6 py-4 text-gray-600">{user.lastActive}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900">Music Management</h2>
              <button
                onClick={() => setShowMusicUpload(true)}
                className="btn-primary flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload Music
              </button>
            </div>

            {/* Music Tracks */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Track Name</th>
                    <th className="px-6 py-4 text-left">Type</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Uploaded By</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMusicTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-blue-900">{track.attributes.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          track.attributes.type === 'background' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {track.attributes.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          track.attributes.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {track.attributes.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{track.attributes.createdAt}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteMusicTrack(track.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Music Upload Modal */}
            {showMusicUpload && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-full max-w-md">
                  <h3 className="text-2xl font-bold text-blue-900 mb-6">Upload Music Track</h3>
                  <form onSubmit={handleMusicUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Track Name</label>
                      <input
                        type="text"
                        value={musicForm.name}
                        onChange={(e) => setMusicForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter track name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={musicForm.type}
                        onChange={(e) => setMusicForm(prev => ({ ...prev, type: e.target.value as 'background' | 'user' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="background">Background</option>
                        <option value="user">User Track</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Audio File</label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            const file = e.target.files[0]
                            setMusicForm(prev => ({ ...prev, audioFile: file }))
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-900 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Upload Track
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMusicUpload(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <section>
            <h2 className="text-3xl font-bold text-blue-900 mb-8">Admin Settings</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">System Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value="Elite Games"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                      <input
                        type="email"
                        value="admin@elitegames.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">Premium Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (£)</label>
                      <input
                        type="number"
                        value="9.99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Free Game Limit</label>
                      <input
                        type="number"
                        value="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <button className="bg-blue-900 text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}