import { AxiosError } from "axios";

interface StrapiError {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: any;
  };
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  requestId?: string;
  userId?: string;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: number;
  public readonly requestId?: string;
  public readonly userId?: string;
  public readonly context?: Record<string, any>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string,
    userId?: string,
    context?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = Date.now();
    this.requestId = requestId;
    this.userId = userId;
    this.context = context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      requestId: this.requestId,
      userId: this.userId,
      context: this.context,
    };
  }
}

/**
 * Standardises error messages to use British English spelling
 */
const britishEnglishMap: Record<string, string> = {
  Authorization: "Authorisation",
  authorized: "authorised",
  Unauthorized: "Unauthorised",
  unauthorized: "unauthorised",
  Initialize: "Initialise",
  initialized: "initialised",
  Customize: "Customise",
  customized: "customised",
  Synchronize: "Synchronise",
  synchronized: "synchronised",
  Organization: "Organisation",
  organization: "organisation",
  // Add more mappings as needed
};

/**
 * Converts American English to British English in a string
 */
export function toBritishEnglish(text: string): string {
  return Object.entries(britishEnglishMap).reduce(
    (result, [american, british]) => {
      const regex = new RegExp(american, "g");
      return result.replace(regex, british);
    },
    text,
  );
}

export const ErrorCodes = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TOKEN_INVALID: "TOKEN_INVALID",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  TOO_MANY_SESSIONS: "TOO_MANY_SESSIONS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",

  // Validation
  VALIDATION_FAILED: "VALIDATION_FAILED",
  REQUIRED_FIELD_MISSING: "REQUIRED_FIELD_MISSING",
  INVALID_FORMAT: "INVALID_FORMAT",
  VALUE_OUT_OF_RANGE: "VALUE_OUT_OF_RANGE",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",

  // File Upload
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  FILE_CORRUPTED: "FILE_CORRUPTED",

  // Database
  RECORD_NOT_FOUND: "RECORD_NOT_FOUND",
  DUPLICATE_RECORD: "DUPLICATE_RECORD",
  DATABASE_ERROR: "DATABASE_ERROR",
  CONSTRAINT_VIOLATION: "CONSTRAINT_VIOLATION",

  // Business Logic
  GAME_NOT_FOUND: "GAME_NOT_FOUND",
  QUESTION_NOT_FOUND: "QUESTION_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  INVALID_GAME_STATE: "INVALID_GAME_STATE",
  GAME_ALREADY_STARTED: "GAME_ALREADY_STARTED",
  GAME_ALREADY_ENDED: "GAME_ALREADY_ENDED",

  // System
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  MAINTENANCE_MODE: "MAINTENANCE_MODE",

  // Network
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  CONNECTION_FAILED: "CONNECTION_FAILED",

  // Legacy support
  BAD_REQUEST: "VALIDATION_FAILED",
  UNAUTHORIZED: "INVALID_CREDENTIALS",
  FORBIDDEN: "INSUFFICIENT_PERMISSIONS",
  NOT_FOUND: "RECORD_NOT_FOUND",
  RATE_LIMITED: "RATE_LIMIT_EXCEEDED",
} as const;

/**
 * Enhanced error messages in British English
 */
export const ErrorMessages = {
  [ErrorCodes.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCodes.TOKEN_EXPIRED]: "Your session has expired. Please sign in again",
  [ErrorCodes.TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]:
    "You don't have permission to perform this action",
  [ErrorCodes.SESSION_EXPIRED]:
    "Your session has expired. Please sign in again",
  [ErrorCodes.TOO_MANY_SESSIONS]:
    "Too many active sessions. Please sign out from other devices",
  [ErrorCodes.ACCOUNT_LOCKED]: "Your account has been temporarily locked",

  [ErrorCodes.VALIDATION_FAILED]: "Please check your input and try again",
  [ErrorCodes.REQUIRED_FIELD_MISSING]: "Required field is missing",
  [ErrorCodes.INVALID_FORMAT]: "Invalid format provided",
  [ErrorCodes.VALUE_OUT_OF_RANGE]: "Value is out of acceptable range",
  [ErrorCodes.DUPLICATE_VALUE]: "This value already exists",

  [ErrorCodes.FILE_TOO_LARGE]: "File size exceeds the maximum limit",
  [ErrorCodes.INVALID_FILE_TYPE]: "File type is not supported",
  [ErrorCodes.UPLOAD_FAILED]: "File upload failed. Please try again",
  [ErrorCodes.FILE_NOT_FOUND]: "File not found",
  [ErrorCodes.FILE_CORRUPTED]: "File appears to be corrupted",

  [ErrorCodes.RECORD_NOT_FOUND]: "Record not found",
  [ErrorCodes.DUPLICATE_RECORD]: "Record already exists",
  [ErrorCodes.DATABASE_ERROR]: "Database operation failed",
  [ErrorCodes.CONSTRAINT_VIOLATION]: "Data constraint violation",

  [ErrorCodes.GAME_NOT_FOUND]: "Game not found",
  [ErrorCodes.QUESTION_NOT_FOUND]: "Question not found",
  [ErrorCodes.CATEGORY_NOT_FOUND]: "Category not found",
  [ErrorCodes.INVALID_GAME_STATE]: "Invalid game state",
  [ErrorCodes.GAME_ALREADY_STARTED]: "Game has already started",
  [ErrorCodes.GAME_ALREADY_ENDED]: "Game has already ended",

  [ErrorCodes.INTERNAL_ERROR]:
    "An internal error occurred. Our team has been notified",
  [ErrorCodes.SERVICE_UNAVAILABLE]: "Service is temporarily unavailable",
  [ErrorCodes.RATE_LIMIT_EXCEEDED]: "Too many requests. Please try again later",
  [ErrorCodes.MAINTENANCE_MODE]: "System is under maintenance",

  [ErrorCodes.NETWORK_ERROR]: "Network error occurred",
  [ErrorCodes.TIMEOUT_ERROR]: "Request timed out",
  [ErrorCodes.CONNECTION_FAILED]: "Connection failed",

  // Legacy support
  BAD_REQUEST:
    "The request was not properly formatted. Please check your input and try again.",
  UNAUTHORIZED:
    "You are not authorised to perform this action. Please sign in and try again.",
  FORBIDDEN: "You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource could not be found.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  INTERNAL_ERROR: "An internal error occurred. Our team has been notified.",
  SERVICE_UNAVAILABLE:
    "This service is temporarily unavailable. Please try again later.",
} as const;

// Error tracking store (use external service in production)
const errorLog: ErrorDetails[] = [];

export class ErrorTracker {
  private static instance: ErrorTracker;

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Log error with context
   */
  logError(error: Error | AppError, context?: Record<string, any>): void {
    const errorDetails: ErrorDetails = {
      code: error instanceof AppError ? error.code : ErrorCodes.INTERNAL_ERROR,
      message: toBritishEnglish(error.message),
      details:
        error instanceof AppError ? error.details : { stack: error.stack },
      timestamp: Date.now(),
      requestId: error instanceof AppError ? error.requestId : undefined,
      userId: error instanceof AppError ? error.userId : undefined,
      context: {
        ...(error instanceof AppError ? error.context : {}),
        ...context,
      },
    };

    errorLog.push(errorDetails);

    // Keep only last 1000 errors in memory
    if (errorLog.length > 1000) {
      errorLog.splice(0, errorLog.length - 1000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("[ERROR]", errorDetails);
    }
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50): ErrorDetails[] {
    return errorLog.slice(-limit);
  }

  /**
   * Get errors by user
   */
  getErrorsByUser(userId: string, limit: number = 50): ErrorDetails[] {
    return errorLog.filter((error) => error.userId === userId).slice(-limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCode: Record<string, number>;
    recentErrorRate: number;
    topErrors: Array<{ code: string; count: number }>;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const recentErrors = errorLog.filter(
      (error) => error.timestamp > oneHourAgo,
    );
    const errorsByCode: Record<string, number> = {};

    for (const error of errorLog) {
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
    }

    const topErrors = Object.entries(errorsByCode)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: errorLog.length,
      errorsByCode,
      recentErrorRate: recentErrors.length,
      topErrors,
    };
  }
}

export const errorTracker = ErrorTracker.getInstance();

/**
 * Parse Strapi error response and extract user-friendly message
 */
export function parseStrapiError(error: unknown): string {
  if (!error) return "An unknown error occurred";

  if (error instanceof AxiosError) {
    const strapiError = error.response?.data as StrapiError;
    if (strapiError?.error) {
      return toBritishEnglish(strapiError.error.message || "An error occurred");
    }
    return toBritishEnglish(error.message || "An error occurred");
  }

  if (error instanceof Error) {
    return toBritishEnglish(error.message);
  }

  return "An unknown error occurred";
}

/**
 * Enhanced error logging with consistent format and relevant details
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, any>,
) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: toBritishEnglish(error.message),
            stack: error.stack,
          }
        : error,
    ...additionalInfo,
  };

  console.error(JSON.stringify(errorDetails, null, 2));

  // Also track with ErrorTracker
  if (error instanceof Error) {
    errorTracker.logError(error, { context, ...additionalInfo });
  }
}

/**
 * Create validation error
 */
export function createValidationError(
  field: string,
  message: string,
  value?: any,
  requestId?: string,
  userId?: string,
): AppError {
  return new AppError(
    ErrorCodes.VALIDATION_FAILED,
    `Validation failed for field '${field}': ${toBritishEnglish(message)}`,
    400,
    { field, value },
    requestId,
    userId,
  );
}

/**
 * Create authentication error
 */
export function createAuthError(
  code: keyof typeof ErrorCodes,
  requestId?: string,
  context?: Record<string, any>,
): AppError {
  return new AppError(
    code,
    ErrorMessages[code],
    401,
    undefined,
    requestId,
    undefined,
    context,
  );
}

/**
 * Create file upload error
 */
export function createFileUploadError(
  code: keyof typeof ErrorCodes,
  fileName?: string,
  requestId?: string,
  userId?: string,
): AppError {
  return new AppError(
    code,
    ErrorMessages[code],
    400,
    { fileName },
    requestId,
    userId,
  );
}

/**
 * Handle async errors with proper logging
 */
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: Record<string, any>,
): Promise<T> {
  return promise.catch((error) => {
    errorTracker.logError(error, context);
    throw error;
  });
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: Record<string, any>,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        errorTracker.logError(lastError, { ...context, attempts: attempt });
        throw lastError;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}
