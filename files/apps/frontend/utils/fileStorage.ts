/**
 * Utilities for file validation, processing and storage
 */

/**
 * Validates if a file is a valid image by attempting to load it
 * @param file The file to validate
 * @returns Promise that resolves to boolean indicating if file is valid
 */
export async function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    // For non-image files, reject immediately
    if (!file.type.startsWith('image/')) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Create object URL for validation
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
    
    // Clean up object URL after validation
    setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
  });
}

/**
 * Validates file size against maximum allowed size
 * @param file The file to validate
 * @param maxSizeBytes Maximum allowed size in bytes
 * @returns Boolean indicating if file size is valid
 */
export function validateFileSize(file: File, maxSizeBytes: number = 2 * 1024 * 1024): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Validates file type against allowed types
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @returns Boolean indicating if file type is valid
 */
export function validateFileType(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg']): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Generates a unique filename for storage
 * @param originalFilename Original filename
 * @returns Unique filename with original extension
 */
export function generateUniqueFilename(originalFilename: string): string {
  const extension = originalFilename.split('.').pop();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Comprehensive file validation
 * @param file The file to validate
 * @param options Validation options
 * @returns Object with validation result and error message if any
 */
export async function validateFile(file: File, options: {
  maxSizeBytes?: number,
  allowedTypes?: string[],
  validateImageContent?: boolean
} = {}): Promise<{ valid: boolean, error?: string }> {
  // Set default options
  const {
    maxSizeBytes = 2 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
    validateImageContent = true
  } = options;
  
  // Check file size
  if (!validateFileSize(file, maxSizeBytes)) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${formatFileSize(maxSizeBytes)}`
    };
  }
  
  // Check file type
  if (!validateFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // For images, validate content
  if (validateImageContent && file.type.startsWith('image/')) {
    const isValidImage = await validateImage(file);
    if (!isValidImage) {
      return {
        valid: false,
        error: 'Invalid image content'
      };
    }
  }
  
  return { valid: true };
} 