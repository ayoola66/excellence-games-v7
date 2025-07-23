import type { Session } from "next-auth";
import type { User } from "next-auth";

export type UserStatus = "Premium" | "Free";

/**
 * Check if a user has premium status
 * @param user The user object from the session or directly from auth
 * @returns boolean indicating if the user has premium status
 */
export function isPremium(user: Session["user"] | User | null | undefined): boolean {
  return user?.status === "Premium";
}

/**
 * Get the user's status as a string
 * @param user The user object from the session or directly from auth
 * @returns "Premium" or "Free"
 */
export function getUserStatus(user: Session["user"] | User | null | undefined): UserStatus {
  return isPremium(user) ? "Premium" : "Free";
}
