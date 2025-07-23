import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accessLevel: string;
  permissions: string[];
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export class AdminAuthService {
  private static instance: AdminAuthService;
  private sessionCache: Map<string, AdminSession> = new Map();

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  async validateToken(token: string): Promise<AdminUser | null> {
    try {
      const response = await fetch(`${STRAPI_URL}/api/admin/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      return {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role?.name || "admin",
        accessLevel: userData.accessLevel || "full",
        permissions: userData.permissions || [],
      };
    } catch (error) {
      console.error("Token validation error:", error);
      return null;
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string } | null> {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/admin/auth/refresh-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        token: data.token,
        refreshToken: data.refreshToken,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  async login(email: string, password: string): Promise<AdminSession | null> {
    try {
      const response = await fetch(`${STRAPI_URL}/api/admin/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const user = await this.validateToken(data.token);

      if (!user) {
        return null;
      }

      const session: AdminSession = {
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      return session;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  getAdminToken(req?: NextRequest): string | null {
    if (req) {
      const token = req.cookies.get("admin_token")?.value;
      return token || null;
    }

    // For client-side usage
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) =>
        c.trim().startsWith("admin_token=")
      );
      return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
    }

    return null;
  }

  getRefreshToken(req?: NextRequest): string | null {
    if (req) {
      const token = req.cookies.get("admin_refresh_token")?.value;
      return token || null;
    }

    // For client-side usage
    if (typeof document !== "undefined") {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((c) =>
        c.trim().startsWith("admin_refresh_token=")
      );
      return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
    }

    return null;
  }

  async getCurrentUser(req?: NextRequest): Promise<AdminUser | null> {
    const token = this.getAdminToken(req);
    if (!token) {
      return null;
    }

    const user = await this.validateToken(token);
    if (user) {
      return user;
    }

    // Try to refresh token
    const refreshToken = this.getRefreshToken(req);
    if (refreshToken) {
      const newTokens = await this.refreshToken(refreshToken);
      if (newTokens) {
        return await this.validateToken(newTokens.token);
      }
    }

    return null;
  }

  hasPermission(user: AdminUser, permission: string): boolean {
    return user.permissions.includes(permission) || user.accessLevel === "full";
  }

  canManageGames(user: AdminUser): boolean {
    return (
      this.hasPermission(user, "game.manage") || user.accessLevel === "full"
    );
  }

  canManageUsers(user: AdminUser): boolean {
    return (
      this.hasPermission(user, "user.manage") || user.accessLevel === "full"
    );
  }

  canManageSettings(user: AdminUser): boolean {
    return (
      this.hasPermission(user, "settings.manage") || user.accessLevel === "full"
    );
  }
}

export const adminAuth = AdminAuthService.getInstance();
