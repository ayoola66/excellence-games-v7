import toast, { ToastOptions } from 'react-hot-toast';

// Custom options type that includes our notification type
interface NotificationOptions extends Omit<ToastOptions, 'type'> {
  type?: 'success' | 'error' | 'info' | 'warning' | 'default';
}

/**
 * NotificationManager - A singleton service to handle notifications and prevent duplicates
 */
class NotificationManager {
  private static instance: NotificationManager;
  private notificationCache: Map<string, number>;
  private readonly CACHE_TIMEOUT = 2000; // 2 seconds deduplication window

  private constructor() {
    this.notificationCache = new Map();
  }

  /**
   * Get the singleton instance of NotificationManager
   */
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Show a success notification with deduplication
   * @param message The message to display
   * @param options Additional toast options
   * @returns The toast ID or null if deduplicated
   */
  public success(message: string, options?: ToastOptions): string | null {
    return this.showNotification(message, { ...options, type: 'success' });
  }

  /**
   * Show an error notification with deduplication
   * @param message The message to display
   * @param options Additional toast options
   * @returns The toast ID or null if deduplicated
   */
  public error(message: string, options?: ToastOptions): string | null {
    return this.showNotification(message, { ...options, type: 'error' });
  }

  /**
   * Show an info notification with deduplication
   * @param message The message to display
   * @param options Additional toast options
   * @returns The toast ID or null if deduplicated
   */
  public info(message: string, options?: ToastOptions): string | null {
    return this.showNotification(message, { ...options, type: 'info' });
  }

  /**
   * Show a warning notification with deduplication
   * @param message The message to display
   * @param options Additional toast options
   * @returns The toast ID or null if deduplicated
   */
  public warning(message: string, options?: ToastOptions): string | null {
    return this.showNotification(message, { ...options, type: 'warning' });
  }

  /**
   * Show a notification with deduplication
   * @param message The message to display
   * @param options Notification options
   * @returns The toast ID or null if deduplicated
   */
  private showNotification(message: string, options?: NotificationOptions): string | null {
    // Create a unique key for this notification
    const type = options?.type || 'default';
    const notificationKey = `${type}-${message}`;
    
    // Check if this notification was recently shown
    const now = Date.now();
    const lastShown = this.notificationCache.get(notificationKey);
    
    if (lastShown && now - lastShown < this.CACHE_TIMEOUT) {
      console.debug(`Prevented duplicate notification: ${message}`);
      return null; // Skip duplicate
    }

    // Add to cache with current timestamp
    this.notificationCache.set(notificationKey, now);
    
    // Clean up old entries periodically
    this.cleanupCache();

    // Extract type from options to avoid passing it to toast functions
    const { type: notificationType, ...toastOptions } = options || {};

    // Show notification using react-hot-toast
    if (type === 'success') {
      return toast.success(message, toastOptions);
    } else if (type === 'error') {
      return toast.error(message, toastOptions);
    } else if (type === 'info') {
      return toast(message, { ...toastOptions, icon: '🔵' });
    } else if (type === 'warning') {
      return toast(message, { ...toastOptions, icon: '⚠️' });
    } else {
      return toast(message, toastOptions);
    }
  }

  /**
   * Clean up old entries from the notification cache
   */
  private cleanupCache(): void {
    const now = Date.now();
    this.notificationCache.forEach((timestamp, key) => {
      if (now - timestamp > this.CACHE_TIMEOUT * 2) {
        this.notificationCache.delete(key);
      }
    });
  }
}

// Export a singleton instance
export const notify = NotificationManager.getInstance();

// For backward compatibility with toast
export const compatToast = {
  success: (message: string, options?: ToastOptions) => notify.success(message, options),
  error: (message: string, options?: ToastOptions) => notify.error(message, options),
  info: (message: string, options?: ToastOptions) => notify.info(message, options),
  warning: (message: string, options?: ToastOptions) => notify.warning(message, options),
  loading: toast.loading,
  custom: toast.custom,
  dismiss: toast.dismiss,
  remove: toast.remove,
};

export default compatToast; 