import crypto from 'crypto'

/**
 * Generates a cryptographically secure random string
 * @param length Length of the random string
 * @returns Random string
 */
export function generateSecureRandomString(length: number = 32): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

/**
 * Validates a password against security requirements
 * @param password Password to validate
 * @returns Object containing validation result and any error messages
 */
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a refresh token
 * @returns A UUID v4 refresh token
 */
export function generateRefreshToken(): string {
  return crypto.randomUUID()
} 