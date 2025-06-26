/**
 * Game type definitions
 */

export interface Game {
  id?: string;
  name: string;
  description?: string;
  type: 'linear' | 'nested';
  status: 'free' | 'premium';
  isActive?: boolean;
  thumbnail?: {
    url: string;
    name: string;
  };
  categories?: Category[];
  questions?: Question[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  gameId?: string;
  game?: Game;
  questions?: Question[];
}

export interface Question {
  id?: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  option5?: string | null;
  correctAnswer: string;
  gameId?: string;
  game?: Game;
  categoryId?: string;
  category?: Category;
  isActive?: boolean;
} 