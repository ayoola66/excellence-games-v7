'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  Square3Stack3DIcon,
  LockClosedIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctAnswer: string
  explanation?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Category {
  id: string
  name: string
  questionCount: number
  cardNumber?: number
}

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  categories: Category[]
  totalQuestions: number
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const gameId = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answerResult, setAnswerResult] = useState<any>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [gamePhase, setGamePhase] = useState<'category-select' | 'question' | 'result'>('category-select')
  const [diceRoll, setDiceRoll] = useState<number | null>(null)

  useEffect(() => {
    fetchGame()
  }, [gameId])

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/api/games/${gameId}`)
      const gameData = response.data.data
      
      // Check access permissions
      if (gameData.status === 'premium' && user?.subscriptionStatus !== 'premium') {
        toast.error('Premium subscription required for this game')
        router.push('/')
        return
      }
      
      setGame(gameData)
    } catch (error) {
      toast.error('Failed to load game')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const rollDice = () => {
    if (!game || game.type !== 'nested') return
    
    const roll = Math.floor(Math.random() * 6) + 1
    setDiceRoll(roll)
    
    // Find category by card number, excluding card 6 (special card)
    const availableCategories = game.categories.filter(cat => 
      cat.cardNumber && cat.cardNumber < 6 && cat.questionCount > 0
    )
    
    if (availableCategories.length === 0) {
      toast.error('No categories available')
      return
    }
    
    const targetCategory = availableCategories.find(cat => cat.cardNumber === roll) || 
                          availableCategories[roll % availableCategories.length]
    
    setTimeout(() => {
      selectCategory(targetCategory)
    }, 2000) // Show dice animation for 2 seconds
  }

  const selectCategory = async (category: Category) => {
    if (category.cardNumber === 6) {
      toast.success('Special card! No questions for this card.')
      return
    }
    
    setSelectedCategory(category)
    setGamePhase('question')
    await fetchQuestion(category.id)
  }

  const fetchQuestion = async (categoryId: string) => {
    try {
      const response = await axios.get(`/api/games/${gameId}/categories/${categoryId}/questions`, {
        params: { excludeIds: answeredQuestions }
      })
      setCurrentQuestion(response.data.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.success('All questions in this category completed!')
        setGamePhase('category-select')
        setSelectedCategory(null)
      } else {
        toast.error('Failed to load question')
      }
    }
  }

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion || selectedAnswer) return
    
    setSelectedAnswer(answer)
    
    try {
      const response = await axios.post(`/api/games/${gameId}/submit-answer`, {
        questionId: currentQuestion.id,
        selectedAnswer: answer
      })
      
      setAnswerResult(response.data.data)
      setAnsweredQuestions(prev => [...prev, currentQuestion.id])
      setShowResult(true)
      
      setTimeout(() => {
        nextQuestion()
      }, 4000) // Show result for 4 seconds
      
    } catch (error) {
      toast.error('Failed to submit answer')
    }
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswerResult(null)
    setCurrentQuestion(null)
    setGamePhase('category-select')
    setSelectedCategory(null)
    setDiceRoll(null)
  }

  const getOptionClass = (option: string) => {
    if (!showResult || !answerResult) {
      return selectedAnswer === option 
        ? 'option-button border-blue-500 bg-blue-50' 
        : 'option-button'
    }
    
    if (option === answerResult.correctAnswer) {
      return 'option-correct'
    }
    if (option === selectedAnswer && option !== answerResult.correctAnswer) {
      return 'option-incorrect'
    }
    return 'option-button opacity-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h2>
          <button onClick={() => router.push('/')} className="btn-primary">
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Games
            </button>
            
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{game.name}</h1>
              <p className="text-sm text-gray-600">
                {game.type === 'nested' ? 'Nested Card Game' : 'Straight Trivia'} • 
                Progress: {answeredQuestions.length} questions answered
              </p>
            </div>
            
            <div className="text-right">
              {user?.subscriptionStatus === 'premium' && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Category Selection Phase */}
          {gamePhase === 'category-select' && (
            <motion.div
              key="category-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {game.type === 'nested' ? 'Roll the Dice!' : 'Choose a Category'}
                </h2>
                <p className="text-gray-600 mb-8">
                  {game.type === 'nested' 
                    ? 'Roll the dice to randomly select your question category'
                    : 'Select a category to begin answering questions'
                  }
                </p>

                {game.type === 'nested' ? (
                  <div className="space-y-6">
                    {/* Dice Roll Animation */}
                    {diceRoll && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        className="text-center"
                      >
                        <div className="text-6xl font-bold text-blue-600 mb-2">{diceRoll}</div>
                        <p className="text-gray-600">Rolling...</p>
                      </motion.div>
                    )}
                    
                    {!diceRoll && (
                      <button
                        onClick={rollDice}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center mx-auto text-lg"
                      >
                        <Square3Stack3DIcon className="h-6 w-6 mr-3" />
                        Roll Dice
                      </button>
                    )}

                    {/* Card Display */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                      {game.categories.map((category) => (
                        <div
                          key={category.id}
                          className={`p-4 rounded-lg border-2 text-center ${
                            category.cardNumber === 6 
                              ? 'border-yellow-300 bg-yellow-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            Card {category.cardNumber}
                          </div>
                          <div className="text-sm text-gray-600">{category.name}</div>
                          {category.cardNumber === 6 && (
                            <div className="text-xs text-yellow-600 mt-1">Special Card</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {game.categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => selectCategory(category)}
                        className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.questionCount} questions available
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Question Phase */}
          {gamePhase === 'question' && currentQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="question-card">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                      {selectedCategory?.name}
                    </span>
                    <span className="ml-2 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentQuestion.question}
                  </h2>
                </div>

                <div className="space-y-3">
                  {['option1', 'option2', 'option3', 'option4'].map((option) => (
                    <button
                      key={option}
                      onClick={() => submitAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={getOptionClass(option)}
                    >
                      <div className="flex items-center">
                        <span className="bg-gray-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-semibold">
                          {option.slice(-1).toUpperCase()}
                        </span>
                        {currentQuestion[option as keyof Question] as string}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Result Display */}
                {showResult && answerResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center mb-4">
                      {answerResult.correct ? (
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                      ) : (
                        <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
                      )}
                      <h3 className="text-xl font-bold">
                        {answerResult.correct ? 'Correct!' : 'Incorrect'}
                      </h3>
                    </div>
                    
                    {answerResult.explanation && (
                      <p className="text-gray-700">
                        <strong>Explanation:</strong> {answerResult.explanation}
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 