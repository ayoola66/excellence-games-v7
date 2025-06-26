export enum AuthErrorType {
  INVALID_REQUEST = 'INVALID_REQUEST',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  RATE_LIMIT = 'RATE_LIMIT',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED'
}

interface AuthErrorDetails {
  message: string
  code?: string
  data?: Record<string, unknown>
}

export class AuthError extends Error {
  readonly type: AuthErrorType
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(type: AuthErrorType, details?: AuthErrorDetails) {
    super(details?.message || getDefaultErrorMessage(type))
    this.name = 'AuthError'
    this.type = type
    this.status = getErrorStatus(type)
    this.details = details?.data
  }

  toJSON() {
    return {
      error: {
        type: this.type,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    }
  }
}

function getDefaultErrorMessage(type: AuthErrorType): string {
  switch (type) {
    case AuthErrorType.INVALID_REQUEST:
      return 'Invalid request parameters'
    case AuthErrorType.INVALID_CREDENTIALS:
      return 'Invalid email or password'
    case AuthErrorType.RATE_LIMIT:
      return 'Too many attempts. Please try again later'
    case AuthErrorType.FORBIDDEN:
      return 'Access denied'
    case AuthErrorType.NETWORK_ERROR:
      return 'Network error occurred'
    case AuthErrorType.SERVER_ERROR:
      return 'Server error occurred'
    case AuthErrorType.TOKEN_EXPIRED:
      return 'Authentication token has expired'
    case AuthErrorType.TOKEN_INVALID:
      return 'Invalid authentication token'
    case AuthErrorType.SESSION_EXPIRED:
      return 'Session has expired'
    default:
      return 'An unknown error occurred'
  }
}

function getErrorStatus(type: AuthErrorType): number {
  switch (type) {
    case AuthErrorType.INVALID_REQUEST:
      return 400
    case AuthErrorType.INVALID_CREDENTIALS:
      return 401
    case AuthErrorType.RATE_LIMIT:
      return 429
    case AuthErrorType.FORBIDDEN:
      return 403
    case AuthErrorType.TOKEN_EXPIRED:
    case AuthErrorType.TOKEN_INVALID:
    case AuthErrorType.SESSION_EXPIRED:
      return 401
    case AuthErrorType.NETWORK_ERROR:
      return 503
    case AuthErrorType.SERVER_ERROR:
    default:
      return 500
  }
}

export function logAuthError(error: AuthError, context?: Record<string, unknown>) {
  console.error('[AUTH ERROR]', {
    type: error.type,
    message: error.message,
    status: error.status,
    details: error.details,
    context
  })
} 