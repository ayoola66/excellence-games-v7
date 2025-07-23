export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Game {
  id: number;
  title: string;
  description: string;
  type: "STRAIGHT" | "NESTED";
  status: "DRAFT" | "PUBLISHED";
  imageUrl?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  text: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  gameId: number;
  parentId?: number;
  order: number;
}

export interface GameFormData {
  name: string;
  description: string;
  type: "STRAIGHT" | "NESTED";
  categories: string[];
  status: "DRAFT" | "PUBLISHED";
  image: File | null;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  playerSubscription: "free" | "premium";
  subscriptionExpires?: string;
  blocked: boolean;
  confirmed: boolean;
  createdAt: string;
  updatedAt: string;
}
