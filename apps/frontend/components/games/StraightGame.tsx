import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import compatToast from '@/lib/notificationManager';
import { useGameQuestions, useSubmitAnswer } from '@/lib/queries'
import clsx from 'clsx'
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
  category?: { id: string }
}

interface Game {
  id: string
  name: string
  description: string
  type: 'straight'
  status: 'free' | 'premium'
  totalQuestions: number
}

interface StraightGameProps {
  game: Game;
  gameId?: string;
  initialGame?: Game;
}

interface AnswerResponse {
  data: {
    correct: boolean
    explanation?: string
  }
}

export default function StraightGame({ game, gameId, initialGame }: StraightGameProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [gameState] = useState<Game>(game || initialGame || {} as Game)
  const gameIdToUse = gameId || game?.id
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; explanation?: string } | null>(null)
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([])
  const [gamePhase, setGamePhase] = useState<'roll' | 'question'>('roll')
  const [diceRoll, setDiceRoll] = useState<number | null>(null)
  const [diceMode, setDiceMode] = useState<'digital' | 'physical' | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [cardQuestions, setCardQuestions] = useState<Record<number, Question[]>>({1:[],2:[],3:[],4:[],5:[]})
  const [cardPointers, setCardPointers] = useState<Record<number, number>>({1:0,2:0,3:0,4:0,5:0})
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [chooseCardModal, setChooseCardModal] = useState(false)
  const [answerEvaluated, setAnswerEvaluated] = useState(false)
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null)
  const [selectedOptionKey, setSelectedOptionKey] = useState<string | null>(null)

  // Use React Query for questions
  const { 
    data: questionsData,
    isLoading,
    error: questionsError
  } = useGameQuestions(gameIdToUse)

  // Use React Query for answer submission
  const { mutate: submitAnswerMutation } = useSubmitAnswer()
  const isSubmitting = false // placeholder, mutation status not critical for new UI

  const allQuestions = (questionsData as any)?.data || []

  // helper to distribute
  const distributeQuestions = (questions: Question[])=>{
    const shuffled = [...questions].sort(()=>Math.random()-0.5)
    const buckets:Record<number,Question[]>={1:[],2:[],3:[],4:[],5:[]}
    shuffled.forEach((q,idx)=>{
      const bucket=((idx)%5)+1 as 1|2|3|4|5
      buckets[bucket].push(q)
    })
    setCardQuestions(buckets)
    setCardPointers({1:0,2:0,3:0,4:0,5:0})
    setAnsweredQuestions([])
  }

  // effect when questions loaded
  useEffect(()=>{
    if(allQuestions.length){
      distributeQuestions(allQuestions as Question[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[questionsData])

  // reset button handler
  const handleReset=()=>{
    distributeQuestions(allQuestions as Question[])
    setGamePhase('roll')
    setDiceRoll(null)
    setShowOptions(false)
    setShowAnswer(false)
    setAwaitingConfirm(false)
    setAnswerEvaluated(false)
    setAnswerCorrect(null)
    setSelectedOptionKey(null)
    compatToast.success('Game reset – questions reshuffled!')
  }

  // modify proceedWithRoll
  const proceedWithRoll=(roll:number)=>{
    setDiceRoll(roll)
    setCurrentQuestion(null)
    setAwaitingConfirm(true)
    setShowOptions(false)
    setShowAnswer(false)
    if(roll===6){
      setChooseCardModal(true)
    }
  }

  const confirmRoll=()=>{
    if(diceRoll===null) return
    if(diceRoll===6){
      // should have been handled by modal
      return
    }
    const pointer=cardPointers[diceRoll]
    const pile=cardQuestions[diceRoll]
    if(pile.length===0){
      compatToast.error('No questions in this card')
      return
    }
    const nextIdx = pointer % pile.length
    const q = pile[nextIdx]
    console.log('Selected question', q)
    setCardPointers({...cardPointers,[diceRoll]: pointer+1})
    setCurrentQuestion(q)
    setGamePhase('question')
    setAwaitingConfirm(false)
  }

  const handleSelectCard=(card:number)=>{
    setChooseCardModal(false)
    setDiceRoll(card)
    setAwaitingConfirm(true)
  }

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentQuestion || selectedAnswer || isSubmitting) return
    setSelectedAnswer(answer)
    setSelectedOptionKey(answer)

    submitAnswerMutation(
      {
        gameId: gameIdToUse,
        questionId: currentQuestion.id,
        categoryId: currentQuestion.category?.id || null,
        answer
      },
      {
        onSuccess: (response: any) => {
          const result = (response as any).data
          setAnswerResult({
            correct: result.correct,
            explanation: result.explanation
          })
          setAnsweredQuestions(prev => [...prev, currentQuestion.id])
          setShowResult(true)

          setTimeout(() => {
            nextQuestion()
          }, 2000)
        },
        onError: () => {
          compatToast.error('Failed to submit answer')
          setSelectedAnswer(null)
          setSelectedOptionKey(null)
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
    setDiceRoll(null)
    setGamePhase('roll')
    setShowOptions(false)
    setShowAnswer(false)
    setAnswerEvaluated(false)
    setAnswerCorrect(null)
  }

  const getOptionClass = (option: string) => {
    if (!showResult || !answerResult) {
      return selectedAnswer === option 
        ? 'option-button border-blue-500 bg-blue-50' 
        : 'option-button'
    }
    if (option === currentQuestion?.correctAnswer) {
      return 'option-correct'
    }
    if (option === selectedAnswer && option !== currentQuestion?.correctAnswer) {
      return 'option-incorrect'
    }
    return 'option-button opacity-50'
  }

  const randomInt = (min:number, max:number)=>{
    const range = max - min + 1
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return min + (array[0] % range)
  }

  const rollDice = () => {
    const roll = randomInt(1,6)
    proceedWithRoll(roll)
  }

  const handlePhysicalSelect = (roll:number)=>{
    proceedWithRoll(roll)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (questionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to load questions
          </h2>
          <button 
            onClick={() => router.push('/user/games')}
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/user/games')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors ml-16 md:ml-56"
          >
            Back to Games
          </button>
          <h1 className="text-lg font-bold text-gray-900">{gameState.name}</h1>
          <div className="flex gap-4">
            <button onClick={handleReset} className="text-sm text-blue-600">Reset</button>
          </div>
        </header>

        {/* Dice Mode Modal */}
        {diceMode === null && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-6">Select Dice Mode</h2>
              <div className="flex flex-col gap-4">
                <button onClick={() => setDiceMode('digital')} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Digital Dice</button>
                <button onClick={() => setDiceMode('physical')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold">Physical Dice</button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 md:p-8 gap-8">
          {/* Left Controls */}
          <aside className="w-full md:w-1/3 flex flex-col items-stretch gap-6">
            {/* Dice Section */}
            <div className="bg-white shadow rounded-xl p-4 flex flex-col items-center gap-4">
              <h3 className="font-bold">Dice</h3>
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-2">
                {(['digital','physical'] as const).map(mode=> (
                  <button
                    key={mode}
                    onClick={()=>setDiceMode(mode)}
                    className={clsx('px-3 py-1 rounded-full text-sm font-semibold', diceMode===mode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}
                  >{mode === 'digital' ? 'Digital' : 'Physical'}</button>
                ))}
              </div>
              {diceMode === 'digital' && (
                <button onClick={rollDice} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold">Roll Dice</button>
              )}
              {diceMode === 'physical' && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {[1,2,3,4,5,6].map(n=> (
                    <button key={n} onClick={()=>handlePhysicalSelect(n)} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold border border-gray-300">{n}</button>
                  ))}
                </div>
              )}
              {diceRoll && <>
                <p className="mt-2 text-lg">Roll: <span className="font-bold">{diceRoll}</span></p>
                {awaitingConfirm && diceRoll!==6 && (
                  <button onClick={confirmRoll} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold">Confirm</button>
                )}
              </>}
            </div>

            {/* Question Card */}
            <div className="bg-white shadow rounded-xl p-4 flex-1 flex flex-col">
              <h3 className="font-bold mb-2">Question</h3>
              {gamePhase !== 'question' && <p className="text-gray-400 flex-1 flex items-center justify-center">Roll the dice to get a question.</p>}
              {gamePhase === 'question' && currentQuestion && (
                <>
                  <p className="mb-4 flex-1 whitespace-pre-wrap">{currentQuestion.question || JSON.stringify(currentQuestion)}</p>
                  {/* Options */}
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
                            className={clsx(
                              'border rounded-lg py-2 px-3 text-left',
                              revealClass
                            )}
                          >{optVal}</button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-gray-400">Options hidden. Click "Reveal Options".</div>
                  )}
                  {showAnswer && answerEvaluated && (
                    <div className="mt-4 text-lg font-semibold" data-testid="result-message">
                      {answerCorrect ? (
                        <span className="text-green-700">Correct! 🎉</span>
                      ) : (
                        <span className="text-red-700">Incorrect ❌</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col gap-3">
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

            {/* Progress */}
            <p className="text-center text-sm text-gray-600 mt-4">Answered {answeredQuestions.length} / {allQuestions.length}</p>
          </aside>

          {/* Right Grid */}
          <section className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
            {[1,2,3,4,5,6].map(n=> {
              const isActive = awaitingConfirm && diceRoll===n && n!==6
              const isDisabled = awaitingConfirm && diceRoll!==n && diceRoll!==6
              return (
                <div
                  key={n}
                  onClick={isActive ? ()=>confirmRoll() : undefined}
                  className={clsx(
                    'h-32 sm:h-40 rounded-xl shadow flex items-center justify-center text-4xl font-bold select-none',
                    n===6 ? 'bg-white' : 'bg-white',
                    isActive ? 'cursor-pointer border-4 border-blue-600 hover:bg-blue-50' : 'border',
                    isDisabled ? 'opacity-40 pointer-events-none border-gray-200' : 'border-gray-200'
                  )}
                >
                  {n === 6 ? '★' : n}
                </div>
              )
            })}
          </section>
        </div>

        {chooseCardModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
              <h2 className="text-xl font-bold mb-6">You rolled a 6! Choose a card</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {[1,2,3,4,5].map(c=> (
                  <button key={c} onClick={()=>{setChooseCardModal(false); handleSelectCard(c)}} className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold border border-gray-300">{c}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 