import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useCategoryQuestions, useSubmitAnswer } from '@/lib/queries'
import { useAuth } from '@/context/AuthContext'
import AuthenticatedMenu from '@/components/AuthenticatedMenu'
import clsx from 'clsx'

interface Question {
  id: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correctAnswer: string
  explanation?: string
}

interface Category {
  id: string
  name: string
  description: string
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
  const [gamePhase, setGamePhase] = useState<'category' | 'question' | 'roll'>('roll')
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null)

  // Dice / card state (copied from StraightGame)
  const [diceRoll, setDiceRoll] = useState<number | null>(null)
  const [diceMode, setDiceMode] = useState<'digital' | 'physical' | null>(null)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [chooseCardModal, setChooseCardModal] = useState(false)

  // Option reveal states (mirroring StraightGame)
  const [showOptions, setShowOptions] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [answerEvaluated, setAnswerEvaluated] = useState(false)
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null)

  // Helper: roll crypto-secure int
  const randomInt = (min:number,max:number)=>{
    const range = max-min+1
    const arr = new Uint32Array(1)
    crypto.getRandomValues(arr)
    return min + (arr[0] % range)
  }

  const proceedWithRoll=(roll:number)=>{
    setDiceRoll(roll)
    setCurrentQuestion(null)
    setAwaitingConfirm(true)
    if(roll===6){
      setChooseCardModal(true)
    }
  }

  const rollDice = ()=>{
    const roll = randomInt(1,6)
    proceedWithRoll(roll)
  }

  const handlePhysicalSelect=(n:number)=>proceedWithRoll(n)

  const confirmRoll = () => {
    if (diceRoll === null || diceRoll === 6) return
    // Map 1-5 straight to index 0-4 regardless of cardNumber field
    const idx = diceRoll - 1
    const selectedCat = game.categories[idx]
    if (selectedCat) {
      selectCategory(selectedCat as any)
    }
    setAwaitingConfirm(false)
  }

  const handleSelectCard=(n:number)=>{
    setChooseCardModal(false)
    setDiceRoll(n)
    confirmRoll()
  }

  const handleReset=()=>{
    setAnsweredQuestions([])
    setGamePhase('roll')
    setDiceRoll(null)
    setCurrentQuestion(null)
    setCurrentCategory(null)
    setAwaitingConfirm(false)
    toast.success('Game reset!')
  }

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
    setCurrentQuestion(null)
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
        categoryId: currentCategory?.id || null,
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
    setShowOptions(false)
    setShowAnswer(false)
    setAnswerEvaluated(false)
    setAnswerCorrect(null)

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

  // When questionsData finishes loading and we're in question phase with a category selected, pick a question
  useEffect(() => {
    if (!isLoading && gamePhase==='question' && currentCategory && !currentQuestion) {
      selectRandomQuestion()
    }
  }, [isLoading, questionsData])

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

          {/* Dice + Question UI (mirrors StraightGame) */}
          {gamePhase==='roll' && (
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
              {/* Left aside (dice + reset) */}
              <aside className="w-full md:w-1/3 flex flex-col items-center gap-6">
                {/* Dice controls */}
                {diceMode===null && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                      <h2 className="text-xl font-bold mb-6">Select Dice Mode</h2>
                      <div className="flex flex-col gap-4">
                        <button onClick={()=>setDiceMode('digital')} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Digital Dice</button>
                        <button onClick={()=>setDiceMode('physical')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">Physical Dice</button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-4">
                  <h3 className="font-bold">Dice</h3>
                  <div className="flex gap-2 mb-2">
                    {(['digital','physical'] as const).map(m=> (
                      <button key={m} onClick={()=>setDiceMode(m)} className={clsx('px-3 py-1 rounded-full text-sm font-semibold', diceMode===m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}>{m==='digital'?'Digital':'Physical'}</button>
                    ))}
                  </div>
                  {diceMode==='digital' && <button onClick={rollDice} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold">Roll Dice</button>}
                  {diceMode==='physical' && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[1,2,3,4,5,6].map(n=> <button key={n} onClick={()=>handlePhysicalSelect(n)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold border border-gray-300">{n===6?'★':n}</button>)}
                    </div>
                  )}
                  {diceRoll && <p className="mt-2 text-lg">Roll: <span className="font-bold">{diceRoll===6?'★':diceRoll}</span></p>}
                  {awaitingConfirm && diceRoll && diceRoll!==6 && <button onClick={confirmRoll} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold">Confirm</button>}
                </div>

                {/* Question Card & controls */}
                <div className="bg-white shadow rounded-xl p-4 w-full flex flex-col gap-4 mt-6">
                  <h3 className="font-bold">Question</h3>
                  {gamePhase !== 'question' && (
                    <p className="text-gray-400 flex-1 text-center py-8">Roll the dice to get a question.</p>
                  )}
                  {gamePhase === 'question' && currentQuestion && (
                    <>
                      <p className="whitespace-pre-wrap">{currentQuestion.question}</p>
                      {(showOptions || showAnswer) ? (
                        <div className="flex flex-col gap-2">
                          {(['option1','option2','option3','option4'] as const).map(opt=>{
                            const optVal = currentQuestion[opt]
                            const isCorrect = opt===currentQuestion.correctAnswer
                            const revealClass = showAnswer
                              ? (isCorrect ? 'bg-green-100 border-green-500' : (selectedAnswer===optVal ? 'bg-red-200 border-red-600' : 'opacity-60'))
                              : (selectedAnswer===optVal ? 'bg-yellow-100 border-yellow-500' : 'bg-white')
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  if(!showOptions || showAnswer) return;
                                  setSelectedAnswer(optVal);
                                  setSelectedOptionKey(opt);
                                }}
                                disabled={!showOptions || showAnswer}
                                className={`border rounded-lg py-2 px-3 text-left ${revealClass}`}
                              >{optVal}</button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-400">Options hidden. Click "Reveal Options".</div>
                      )}
                      {showAnswer && answerEvaluated && (
                        <div className="mt-2 text-lg font-semibold">
                          {answerCorrect ? <span className="text-green-700">Correct! 🎉</span> : <span className="text-red-700">Incorrect ❌</span>}
                        </div>
                      )}
                    </>
                  )}
                  {/* Control buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={()=>setShowOptions(true)} disabled={showOptions || gamePhase!=='question'} className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold">Reveal Options</button>
                    <button
                      onClick={() => {
                        if (!showOptions) setShowOptions(true)
                        setShowAnswer(true)
                        if (selectedAnswer) {
                          setAnswerEvaluated(true)
                          setAnswerCorrect(selectedOptionKey === currentQuestion?.correctAnswer)
                        } else {
                          setAnswerEvaluated(false)
                        }
                      }}
                      disabled={showAnswer || gamePhase!=='question'}
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold"
                    >Reveal Answer</button>
                    <button onClick={nextQuestion} disabled={gamePhase==='roll'} className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold">Next Turn</button>
                  </div>
                </div>
              </aside>

              {/* Card grid (hidden during question phase) */}
              {gamePhase==='roll' && (
                <section className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
                  {[1,2,3,4,5,6].map(n=>{
                    const category = game.categories.find(c=>(c as any).cardNumber===n) || game.categories[n-1]
                    const label = n===6 ? '★' : (category?.name || n)
                    const isActive = awaitingConfirm && diceRoll===n && n!==6
                    const isDisabled = awaitingConfirm && diceRoll!==n && diceRoll!==6
                    return (
                      <div key={n} onClick={isActive?confirmRoll:undefined} className={clsx('h-28 sm:h-32 rounded-xl shadow flex items-center justify-center text-xl font-bold select-none cursor-pointer', isDisabled?'opacity-40':'bg-white hover:shadow-lg', isActive && 'ring-4 ring-purple-500')}>{label}</div>
                    )
                  })}
                </section>
              )}

              {/* Choose card modal for roll 6 */}
              {chooseCardModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                    <h2 className="text-xl font-bold mb-6">Pick a Card</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {game.categories.slice(0,5).map((cat,idx)=> (
                        <button key={cat.id} onClick={()=>handleSelectCard((cat as any).cardNumber || idx+1)} className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">{cat.name}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 