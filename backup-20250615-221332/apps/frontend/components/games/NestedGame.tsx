import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCategoryQuestions, useSubmitAnswer } from '@/lib/queries'
import { useAuth } from '@/context/AuthContext'
import AuthenticatedMenu from '@/components/AuthenticatedMenu'

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
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Game {
  id: string
  name: string
  description: string
  type: 'nested'
  status: 'free' | 'premium'
  categories: Category[]
}

interface AnswerResponse {
  data: {
    correct: boolean
    explanation?: string
  }
}

interface NestedGameProps {
  gameId: string
  initialGame: Game
}

export default function NestedGame({ gameId, initialGame }: NestedGameProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [game] = useState<Game>(initialGame)
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; explanation?: string } | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<'category' | 'question'>('category')
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null)

  // Use React Query for category questions
  const { 
    data: questionsData,
    isLoading,
    error: questionsError
  } = useCategoryQuestions(
    gameId, 
    currentCategory?.id || '', 
    answeredQuestions
  )

  // Use React Query for answer submission
  const { mutate: submitAnswerMutation } = useSubmitAnswer()
  const isSubmitting = false

  const availableQuestions = questionsData?.data || []

  const selectCategory = (category: Category) => {
    setCurrentCategory(category)
    setGamePhase('question')
    selectRandomQuestion()
  }

  const selectRandomQuestion = () => {
    if (!availableQuestions.length) {
      toast.success('All questions in this category completed!')
      setGamePhase('category')
      setCurrentCategory(null)
      return
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    setCurrentQuestion(availableQuestions[randomIndex])
  }

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion || selectedAnswer || isSubmitting) return
    setSelectedAnswer(answer)

    submitAnswerMutation(
      {
        gameId,
        questionId: currentQuestion.id,
        answer
      },
      {
        onSuccess: (data: AnswerResponse) => {
          const result = data.data
          setAnswerResult({
            correct: selectedOptionKey === currentQuestion.correctAnswer,
            explanation: result.explanation
          })
          setAnsweredQuestions(prev => [...prev, currentQuestion.id])
          setShowResult(true)

          setTimeout(() => {
            nextQuestion()
          }, 2000)
        },
        onError: () => {
          toast.error('Failed to submit answer')
          setSelectedAnswer(null)
        }
      }
    )
  }

  const nextQuestion = () => {
    setSelectedAnswer(null)
    setSelectedOptionKey(null)
    setShowResult(false)
    setAnswerResult(null)
    setCurrentQuestion(null)

    // Check if all questions in category are answered
    const remainingQuestions = availableQuestions.filter((q: Question) => !answeredQuestions.includes(q.id))
    if (remainingQuestions.length === 0) {
      setGamePhase('category')
      setCurrentCategory(null)
      toast.success('Category completed!')
    } else {
      selectRandomQuestion()
    }
  }

  const getOptionClass = (option: string) => {
    if (!showResult || !answerResult) {
      return selectedOptionKey === option ? 'option-button border-yellow-500 bg-yellow-50' : 'option-button'
    }
    if (option === currentQuestion?.correctAnswer) {
      return 'option-correct'
    }
    if (selectedOptionKey === option && option !== currentQuestion?.correctAnswer) {
      return 'option-incorrect'
    }
    return 'option-button opacity-50'
  }

  if (questionsError && gamePhase === 'question') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load questions
          </h2>
          <button 
            onClick={() => router.push(user ? '/user/dashboard' : '/')}
            className="text-blue-600 hover:text-blue-800"
          >
            Return to Games
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <AuthenticatedMenu />
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => router.push(user ? '/user/dashboard' : '/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors ml-16 md:ml-56"
              >
                Back to Games
              </button>
              <div className="text-center">
                <h1 className="text-xl font-bold text-gray-900">{game.name}</h1>
                {currentCategory && (
                  <p className="text-sm text-gray-600">
                    Category: {currentCategory.name}
                  </p>
                )}
              </div>
              {currentCategory && (
                <button
                  onClick={() => {
                    setGamePhase('category')
                    setCurrentCategory(null)
                    setCurrentQuestion(null)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Change Category
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Game Progress */}
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              Questions Answered: {answeredQuestions.length}
            </p>
          </div>

          {/* Category Selection Phase */}
          {gamePhase === 'category' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {game.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category)}
                  className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                  <div className="mt-4">
                    <span className={`
                      inline-block px-3 py-1 rounded-full text-sm font-medium
                      ${category.difficulty === 'easy' ? 'bg-green-100 text-green-800' : ''}
                      ${category.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${category.difficulty === 'hard' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {category.difficulty.charAt(0).toUpperCase() + category.difficulty.slice(1)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Question Phase */}
          {gamePhase === 'question' && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
              ) : currentQuestion ? (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    {currentQuestion.question}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {(['option1', 'option2', 'option3', 'option4'] as const).map((option) => {
                      const optValue = currentQuestion[option]
                      return (
                        <button
                          key={option}
                          onClick={() => {setSelectedOptionKey(option);handleAnswerSubmit(optValue)}}
                          disabled={!!selectedAnswer || isSubmitting}
                          className={getOptionClass(optValue)}
                        >
                          {optValue}
                        </button>
                      )
                    })}
                  </div>
                  {showResult && answerResult && (
                    <div className="mt-8 p-6 rounded-lg bg-gray-50">
                      <div className="flex items-center mb-4">
                        <h3 className="text-xl font-bold">
                          {answerResult.correct ? 'Correct!' : 'Incorrect'}
                        </h3>
                      </div>
                      {answerResult.explanation && (
                        <p className="text-gray-700">
                          <strong>Explanation:</strong> {answerResult.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 