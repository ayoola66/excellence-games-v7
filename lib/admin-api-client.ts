import axios, { AxiosInstance, AxiosResponse } from "axios";
import { adminAuth, AdminUser } from "./admin-auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface Game {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  thumbnail?: string;
  isActive: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameData {
  title: string;
  description: string;
  type: string;
  status: string;
  thumbnail?: File;
  isActive?: boolean;
  isPremium?: boolean;
}

export interface UpdateGameData extends Partial<CreateGameData> {
  id: number;
}

export interface DashboardStats {
  totalGames: number;
  totalUsers: number;
  activeGames: number;
  totalCategories: number;
}

export interface PageContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  lastModified: string;
}

export interface CreatePageData {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  requiresAuth?: boolean;
}

class AdminApiClient {
  private baseUrl = "/api/admin";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/dashboard/stats");
  }

  async getGames(): Promise<{ data: Game[] }> {
    return this.request<{ data: Game[] }>("/games");
  }

  async getPages(): Promise<{ data: PageContent[] }> {
    return this.request<{ data: PageContent[] }>("/pages");
  }

  async createPage(data: CreatePageData): Promise<PageContent> {
    return this.request<PageContent>("/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePage(
    id: string,
    data: Partial<CreatePageData>,
  ): Promise<PageContent> {
    return this.request<PageContent>(`/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string): Promise<void> {
    return this.request<void>(`/pages/${id}`, {
      method: "DELETE",
    });
  }
}

// Export a singleton instance
const adminApiClient = new AdminApiClient();
export { adminApiClient };
