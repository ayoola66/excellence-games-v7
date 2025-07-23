import { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// For TypeScript type checking
export interface ApiErrorType {
  message: string;
  status: number;
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

export const createStrapiHeaders = (token?: string) => {
  const apiToken = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  return {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };
};

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;

    if (status === 401 || status === 403) {
      // Clear admin token on auth errors
      document.cookie =
        "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/admin/login";
    }

    return { message, status };
  }

  return {
    message:
      error instanceof Error ? error.message : "An unknown error occurred",
    status: 500,
  };
};

export const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
