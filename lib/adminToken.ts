import { cookies } from "next/headers";

interface AdminTokens {
  token: string | null;
  refreshToken: string | null;
}

export function getAdminTokens(): AdminTokens {
  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Client-side: Get tokens from document.cookie
    const cookies = document.cookie.split(";");
    let token = null;
    let refreshToken = null;

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "admin_token") {
        token = decodeURIComponent(value);
      } else if (name === "admin_refresh_token") {
        refreshToken = decodeURIComponent(value);
      }
    }

    return { token, refreshToken };
  } else {
    // Server-side: Get tokens from next/headers cookies
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value ?? null;
    const refreshToken = cookieStore.get("admin_refresh_token")?.value ?? null;
    return { token, refreshToken };
  }
}

export function setAdminTokens(token: string, refreshToken: string) {
  // Set tokens in cookies
  document.cookie = `admin_token=${token}; path=/`;
  document.cookie = `admin_refresh_token=${refreshToken}; path=/`;
}

export function clearAdminTokens() {
  // Clear tokens from cookies
  document.cookie =
    "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  document.cookie =
    "admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
}
