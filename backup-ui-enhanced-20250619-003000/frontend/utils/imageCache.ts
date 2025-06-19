/**
 * Simple image caching utility to improve performance and reduce redundant requests
 */

// In-memory cache for image URLs
const imageCache = new Map<string, { url: string, timestamp: number }>();

// Cache expiration time (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Maximum cache size
const MAX_CACHE_SIZE = 100;

/**
 * Adds an image URL to the cache
 * @param key Unique identifier for the image (e.g., "game-1-thumbnail")
 * @param url The image URL to cache
 */
export function cacheImage(key: string, url: string): void {
  // Clean expired entries if cache is getting full
  if (imageCache.size >= MAX_CACHE_SIZE) {
    cleanExpiredCache();
  }
  
  // If still at capacity, remove oldest entry
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = findOldestCacheEntry();
    if (oldestKey) {
      imageCache.delete(oldestKey);
    }
  }
  
  // Add new entry to cache
  imageCache.set(key, {
    url,
    timestamp: Date.now()
  });
}

/**
 * Retrieves an image URL from the cache
 * @param key Unique identifier for the image
 * @returns The cached URL or null if not found
 */
export function getCachedImage(key: string): string | null {
  const entry = imageCache.get(key);
  
  // Not in cache
  if (!entry) {
    return null;
  }
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
    imageCache.delete(key);
    return null;
  }
  
  // Update timestamp to keep frequently accessed images in cache
  entry.timestamp = Date.now();
  return entry.url;
}

/**
 * Removes an image from the cache
 * @param key Unique identifier for the image
 */
export function invalidateCache(key: string): void {
  imageCache.delete(key);
}

/**
 * Clears the entire image cache
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Removes expired entries from the cache
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  // Use forEach to avoid downlevelIteration issues
  imageCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      imageCache.delete(key);
    }
  });
}

/**
 * Finds the oldest entry in the cache
 * @returns The key of the oldest entry or null if cache is empty
 */
function findOldestCacheEntry(): string | null {
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  
  // Use forEach to avoid downlevelIteration issues
  imageCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      oldestKey = key;
    }
  });
  
  return oldestKey;
}

/**
 * Preloads an image into the browser cache
 * @param url The image URL to preload
 * @returns Promise that resolves when image is loaded or rejects on error
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
}

/**
 * Batch preloads multiple images
 * @param urls Array of image URLs to preload
 * @returns Promise that resolves when all images are loaded
 */
export async function preloadImages(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map(url => preloadImage(url)));
  } catch (error) {
    console.error('Error preloading images:', error);
  }
} 