import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api'
})

// Types
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

interface GameResponse {
  data: {
    id: string
    name: string
    description: string
    type: 'straight' | 'nested'
    status: 'free' | 'premium'
    categories: any[]
    totalQuestions: number
  }
}

interface QuestionsResponse {
  data: Question[]
}

// Query keys
export const queryKeys = {
  game: (id: string) => ['game', id],
  questions: (gameId: string) => ['questions', gameId],
  categoryQuestions: (gameId: string, categoryId: string) => ['questions', gameId, categoryId],
}

// Game queries
export function useGame(gameId: string) {
  return useQuery({
    queryKey: queryKeys.game(gameId),
    queryFn: async () => {
      const response = await api.get<GameResponse>(`/games/${gameId}`)
      return response.data
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

// Questions queries
export function useGameQuestions(gameId: string) {
  return useQuery({
    queryKey: queryKeys.questions(gameId),
    queryFn: async () => {
      try {
        const response = await api.get(`/questions`, {
          params: {
            'filters[game][id][$eq]': gameId,
            'populate': '*'
          }
        })
        const flat = response.data.data.map((item: any) => ({ id: item.id, ...item.attributes }))
        return { data: flat }
      } catch (error: any) {
        console.error('Failed to fetch questions:', error.response?.data || error.message)
        throw new Error(error.response?.data?.error?.message || 'Failed to load questions')
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
}

export function useCategoryQuestions(gameId: string, categoryId: string, excludeIds: string[]) {
  return useQuery({
    queryKey: queryKeys.categoryQuestions(gameId, categoryId),
    queryFn: async () => {
      const response = await api.get(`/games/${gameId}/categories/${categoryId}/questions`, {
        params: { excludeIds }
      })
      return response.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

// Answer submission mutation
export function useSubmitAnswer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      gameId, 
      questionId, 
      answer 
    }: { 
      gameId: string
      questionId: string
      answer: string 
    }) => {
      const response = await api.post(`/games/${gameId}/submit-answer`, {
        questionId,
        selectedAnswer: answer
      })
      return response.data
    },
    // Optimistically update the cache
    onSuccess: (_, { gameId }) => {
      // Invalidate relevant queries after successful submission
      queryClient.invalidateQueries({ queryKey: queryKeys.questions(gameId) })
    },
  })
}

// Progress tracking
export function useGameProgress(gameId: string) {
  return useQuery({
    queryKey: ['gameProgress', gameId],
    queryFn: async () => {
      const response = await api.get(`/games/${gameId}/progress`)
      return response.data
    },
    staleTime: 1 * 60 * 1000, // Consider data fresh for 1 minute
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  })
} 