import { useState, useCallback } from 'react';
import axiosInstance from './axios';
import { notificationManager } from './notificationManager';

export const fetchGame = async (id: string) => {
  const response = await axiosInstance.get(`/api/games/${id}`);
  return response.data;
};

export const submitAnswer = async (gameId: string, questionId: string, answer: string) => {
  const response = await axiosInstance.post(`/api/games/${gameId}/questions/${questionId}/answer`, {
    answer,
  });
  return response.data;
};

export const fetchGameProgress = async (gameId: string) => {
  const response = await axiosInstance.get(`/api/games/${gameId}/progress`);
  return response.data;
};

export const useCategoryQuestions = (categoryId: string) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/categories/${categoryId}/questions`);
      setQuestions(response.data);
    } catch (err: any) {
      setError(err.message);
      notificationManager.error('Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  return { questions, isLoading, error, fetchQuestions };
};

export const useGameQuestions = (gameId: string) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/games/${gameId}/questions`);
      setQuestions(response.data);
    } catch (err: any) {
      setError(err.message);
      notificationManager.error('Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  return { questions, isLoading, error, fetchQuestions };
};

export const useSubmitAnswer = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (gameId: string, questionId: string, answer: string) => {
    setIsSubmitting(true);
    try {
      const response = await submitAnswer(gameId, questionId, answer);
      notificationManager.success('Answer submitted successfully');
      return response;
    } catch (err: any) {
      setError(err.message);
      notificationManager.error('Failed to submit answer');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}; 