import { NextResponse } from "next/server";

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; timestamp: number }>();

export async function loginRateLimiter(request: Request) {
  if (process.env.NODE_ENV === "test") {
    return null; // Disable rate limiting in test environment
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 10; // 10 attempts per minute

  const userAttempts = attempts.get(ip) || { count: 0, timestamp: now };

  // Reset if window has passed
  if (now - userAttempts.timestamp > windowMs) {
    userAttempts.count = 0;
    userAttempts.timestamp = now;
  }

  if (userAttempts.count >= maxAttempts) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please wait a moment and try again.",
      },
      { status: 429 }
    );
  }

  userAttempts.count++;
  attempts.set(ip, userAttempts);

  return null;
}

export async function apiRateLimiter(request: Request) {
  if (process.env.NODE_ENV === "test") {
    return null; // Disable rate limiting in test environment
  }

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 100; // 100 requests per minute

  const userAttempts = attempts.get(ip) || { count: 0, timestamp: now };

  // Reset if window has passed
  if (now - userAttempts.timestamp > windowMs) {
    userAttempts.count = 0;
    userAttempts.timestamp = now;
  }

  if (userAttempts.count >= maxAttempts) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
      },
      { status: 429 }
    );
  }

  userAttempts.count++;
  attempts.set(ip, userAttempts);

  return null;
}

export function recordSuccessfulLogin(ip: string) {
  attempts.delete(ip); // Reset attempts on successful login
}