/**
 * API retry utility for handling transient errors
 */

/**
 * Options for retry mechanism
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay in milliseconds between retries */
  baseDelay: number;
  /** Whether to use exponential backoff */
  useExponentialBackoff: boolean;
  /** Optional function to determine if error is retryable */
  isRetryable?: (error: any) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 500,
  useExponentialBackoff: true,
  isRetryable: (error: any) => {
    // Default retryable errors: network errors or 5xx server errors
    if (!error.response) {
      return true; // Network error
    }
    
    const status = error.response.status;
    return status >= 500 && status < 600; // Server errors
  }
};

/**
 * Executes a function with retry logic
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise with the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const retryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} of ${retryOptions.maxRetries}`);
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const isLastAttempt = attempt >= retryOptions.maxRetries;
      const isRetryable = retryOptions.isRetryable?.(error) ?? true;
      
      if (isLastAttempt || !isRetryable) {
        console.error('Max retries reached or error not retryable:', error);
        break;
      }
      
      // Calculate delay with exponential backoff if enabled
      const delay = retryOptions.useExponentialBackoff
        ? retryOptions.baseDelay * Math.pow(2, attempt)
        : retryOptions.baseDelay;
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Wraps a function with retry logic
 * @param fn Function to wrap
 * @param options Retry options
 * @returns Wrapped function with retry logic
 */
export function withRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    return withRetry(() => fn(...args), options) as ReturnType<T>;
  };
}

/**
 * Creates a retry-enabled fetch function
 * @param options Retry options
 * @returns Fetch function with retry logic
 */
export function createRetryFetch(options: Partial<RetryOptions> = {}) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return withRetry(async () => {
      const response = await fetch(input, init);
      
      // Consider non-2xx responses as errors that may need retry
      if (!response.ok) {
        const error: any = new Error(`HTTP error! Status: ${response.status}`);
        error.response = response;
        throw error;
      }
      
      return response;
    }, options);
  };
} 