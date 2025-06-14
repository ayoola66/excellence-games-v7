'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  Square3Stack3DIcon,
  LockClosedIcon,
  SpeakerWaveIcon,
  TrophyIcon
} from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'
import SoundControls from '@/components/SoundControls'

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
  description?: string
  cardNumber?: number
  questionCount: number
}

interface Game {
  id: string
  name: string
  description: string
  type: 'straight' | 'nested'
  status: 'free' | 'premium'
  categories: Category[]
  totalQuestions: number
  userProgress?: {
    started: boolean
    completed: boolean
    currentCategory: string | null
    categoriesCompleted: { [key: string]: boolean }
    score: number
    lastPlayed: string | null
  }
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { playSound } = useSound()
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
  const [showExplanation, setShowExplanation] = useState(false)
  const [streak, setStreak] = useState(0)

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
      
      // Initialize answered questions from user progress
      if (gameData.userProgress?.categoriesCompleted) {
        const answeredIds = Object.entries(gameData.userProgress.categoriesCompleted)
          .filter(([_, completed]) => completed)
          .map(([categoryId]) => categoryId)
        setAnsweredQuestions(answeredIds)
      }
    } catch (error) {
      toast.error('Failed to load game')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const rollDice = () => {
    if (!game || game.type !== 'nested') return
    
    playSound('dice')
    const roll = Math.floor(Math.random() * 6) + 1
    setDiceRoll(roll)
    
    // Find category by card number
    const availableCategories = game.categories.filter(cat => 
      cat.cardNumber && cat.cardNumber <= 6 && cat.questionCount > 0
    )
    
    if (availableCategories.length === 0) {
      toast.error('No categories available')
      return
    }
    
    const targetCategory = availableCategories.find(cat => cat.cardNumber === roll)
    
    setTimeout(() => {
      if (targetCategory) {
        if (targetCategory.cardNumber === 6) {
          handleSpecialCard()
        } else {
          selectCategory(targetCategory)
        }
      }
    }, 2000) // Show dice animation for 2 seconds
  }

  const handleSpecialCard = () => {
    toast.success('Special card! Choose any other card to answer from.')
    setDiceRoll(null)
    setGamePhase('category-select')
  }

  const selectCategory = async (category: Category) => {
    playSound('click')
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
    
    playSound('click')
    setSelectedAnswer(answer)
    
    try {
      const response = await axios.post(`/api/games/${gameId}/submit-answer`, {
        questionId: currentQuestion.id,
        selectedAnswer: answer
      })
      
      const result = response.data.data
      setAnswerResult(result)
      setAnsweredQuestions(prev => [...prev, currentQuestion.id])
      setShowResult(true)
      
      // Update streak
      if (result.correct) {
        playSound('correct')
        setStreak(prev => prev + 1)
        if ((streak + 1) % 5 === 0) {
          playSound('success')
          toast.success(`${streak + 1} correct answers in a row!`)
        }
      } else {
        playSound('incorrect')
        setStreak(0)
      }
      
      // Show explanation if available
      if (result.explanation) {
        setShowExplanation(true)
      }
      
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
    setShowExplanation(false)
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
            
            <div className="flex items-center space-x-4">
              {streak > 0 && (
                <div className="flex items-center text-yellow-600">
                  <TrophyIcon className="h-5 w-5 mr-1" />
                  <span className="font-medium">{streak}</span>
                </div>
              )}
              <SoundControls />
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
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      {game.categories
                        .filter(cat => cat.cardNumber && cat.cardNumber <= 6)
                        .sort((a, b) => (a.cardNumber || 0) - (b.cardNumber || 0))
                        .map(category => (
                          <motion.div
                            key={category.id}
                            whileHover={{ scale: 1.05 }}
                            className={`p-6 rounded-xl ${
                              diceRoll === category.cardNumber
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-white'
                            }`}
                          >
                            <h3 className="text-lg font-bold mb-2">
                              Card {category.cardNumber}
                            </h3>
                            <p className="text-sm text-gray-600">{category.name}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {category.questionCount} questions
                            </p>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {game.categories.map(category => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => selectCategory(category)}
                        className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        <h3 className="text-lg font-bold mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600">
                          {category.questionCount} questions
                        </p>
                      </motion.button>
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
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {selectedCategory && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-600">
                    {game.type === 'nested' ? `Card ${selectedCategory.cardNumber}` : selectedCategory.name}
                  </h3>
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {['option1', 'option2', 'option3', 'option4'].map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => submitAnswer(currentQuestion[option])}
                    disabled={!!selectedAnswer}
                    className={getOptionClass(currentQuestion[option])}
                  >
                    {currentQuestion[option]}
                  </motion.button>
                ))}
              </div>

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
                  
                  {showExplanation && answerResult.explanation && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-700"
                    >
                      <strong>Explanation:</strong> {answerResult.explanation}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}