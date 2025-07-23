import { NextRequest } from "next/server";
import { writeFile, mkdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export interface FileUploadConfig {
  maxFileSize: number; // in bytes
  allowedTypes: string[];
  uploadDir: string;
  enableCompression: boolean;
  enableVersioning: boolean;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: number;
  version?: number;
  compressed?: boolean;
  checksum?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

export interface BulkUploadResult {
  success: boolean;
  uploadedFiles: UploadedFile[];
  errors: Array<{ fileName: string; error: string }>;
  totalFiles: number;
  successCount: number;
  errorCount: number;
}

const DEFAULT_CONFIG: FileUploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB (increased for better admin experience)
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/json",
    "text/plain",
    "application/pdf",
    "text/markdown",
    "application/zip",
  ],
  uploadDir: "uploads",
  enableCompression: true,
  enableVersioning: true,
};

// In-memory progress tracking (use Redis in production)
const uploadProgress = new Map<string, UploadProgress>();
const fileVersions = new Map<string, UploadedFile[]>();

export class EnhancedFileUploadService {
  private static instance: EnhancedFileUploadService;
  private config: FileUploadConfig;

  constructor(config: Partial<FileUploadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(
    config?: Partial<FileUploadConfig>,
  ): EnhancedFileUploadService {
    if (!EnhancedFileUploadService.instance) {
      EnhancedFileUploadService.instance = new EnhancedFileUploadService(
        config,
      );
    }
    return EnhancedFileUploadService.instance;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`,
      };
    }

    // Check file type
    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${this.config.allowedTypes.join(", ")}`,
      };
    }

    // Check for malicious file names
    if (this.containsMaliciousPatterns(file.name)) {
      return {
        valid: false,
        error: "File name contains invalid characters",
      };
    }

    return { valid: true };
  }

  /**
   * Check for malicious patterns in file names
   */
  private containsMaliciousPatterns(fileName: string): boolean {
    const maliciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
      /\.(exe|bat|cmd|scr|pif|com)$/i, // Executable extensions
    ];

    return maliciousPatterns.some((pattern) => pattern.test(fileName));
  }

  /**
   * Generate secure file name
   */
  private generateSecureFileName(originalName: string): string {
    const extension = originalName.split(".").pop() || "";
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueId = randomUUID().split("-")[0];

    return `${sanitizedBaseName}_${uniqueId}.${extension}`;
  }

  /**
   * Calculate file checksum
   */
  private async calculateChecksum(buffer: ArrayBuffer): Promise<string> {
    const crypto = await import("crypto");
    const hash = crypto.createHash("sha256");
    hash.update(new Uint8Array(buffer));
    return hash.digest("hex");
  }

  /**
   * Compress image if needed
   */
  private async compressImage(
    buffer: ArrayBuffer,
    mimeType: string,
  ): Promise<ArrayBuffer> {
    if (!this.config.enableCompression || !mimeType.startsWith("image/")) {
      return buffer;
    }

    try {
      // Use sharp for image compression
      const sharp = require("sharp");

      // Convert ArrayBuffer to Buffer for sharp
      const inputBuffer = Buffer.from(buffer);

      const compressed = await sharp(inputBuffer)
        .resize(1920, 1080, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Return as ArrayBuffer
      return compressed.buffer.slice(
        compressed.byteOffset,
        compressed.byteOffset + compressed.byteLength,
      );
    } catch (error) {
      console.warn("Image compression failed, using original:", error);
      return buffer;
    }
  }

  /**
   * Upload single file with progress tracking
   */
  async uploadFile(
    file: File,
    options: {
      onProgress?: (progress: UploadProgress) => void;
      category?: string;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<UploadedFile> {
    const fileId = randomUUID();

    // Initialize progress tracking
    const progress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: "uploading",
    };

    uploadProgress.set(fileId, progress);
    options.onProgress?.(progress);

    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Update progress
      progress.progress = 10;
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();

      progress.progress = 30;
      progress.status = "processing";
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      // Compress if needed
      const processedBuffer = await this.compressImage(arrayBuffer, file.type);

      progress.progress = 50;
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      // Calculate checksum
      const checksum = await this.calculateChecksum(processedBuffer);

      progress.progress = 70;
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      // Generate secure file name and path
      const fileName = this.generateSecureFileName(file.name);
      const uploadDir = join(
        process.cwd(),
        "public",
        this.config.uploadDir,
        options.category || "general",
      );

      // Ensure upload directory exists
      await mkdir(uploadDir, { recursive: true });

      const filePath = join(uploadDir, fileName);

      // Write file
      await writeFile(filePath, new Uint8Array(processedBuffer));

      progress.progress = 90;
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      // Create uploaded file record
      const uploadedFile: UploadedFile = {
        id: fileId,
        originalName: file.name,
        fileName,
        filePath: filePath.replace(process.cwd() + "/public", ""),
        mimeType: file.type,
        size: processedBuffer.byteLength,
        uploadedAt: Date.now(),
        compressed: processedBuffer.byteLength < arrayBuffer.byteLength,
        checksum,
      };

      // Handle versioning
      if (this.config.enableVersioning) {
        const versions = fileVersions.get(file.name) || [];
        uploadedFile.version = versions.length + 1;
        versions.push(uploadedFile);
        fileVersions.set(file.name, versions);
      }

      // Complete progress
      progress.progress = 100;
      progress.status = "completed";
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);

      return uploadedFile;
    } catch (error) {
      progress.status = "error";
      progress.error = error instanceof Error ? error.message : String(error);
      uploadProgress.set(fileId, progress);
      options.onProgress?.(progress);
      throw error;
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: File[],
    options: {
      onProgress?: (fileId: string, progress: UploadProgress) => void;
      onComplete?: (result: BulkUploadResult) => void;
      category?: string;
      metadata?: Record<string, any>;
      maxConcurrent?: number;
    } = {},
  ): Promise<BulkUploadResult> {
    const maxConcurrent = options.maxConcurrent || 3;
    const uploadedFiles: UploadedFile[] = [];
    const errors: Array<{ fileName: string; error: string }> = [];

    // Process files in batches
    for (let i = 0; i < files.length; i += maxConcurrent) {
      const batch = files.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (file) => {
        try {
          const uploadedFile = await this.uploadFile(file, {
            onProgress: (progress) =>
              options.onProgress?.(progress.fileId, progress),
            category: options.category,
            metadata: options.metadata,
          });
          uploadedFiles.push(uploadedFile);
        } catch (error) {
          errors.push({
            fileName: file.name,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });

      await Promise.all(batchPromises);
    }

    const result: BulkUploadResult = {
      success: errors.length === 0,
      uploadedFiles,
      errors,
      totalFiles: files.length,
      successCount: uploadedFiles.length,
      errorCount: errors.length,
    };

    options.onComplete?.(result);
    return result;
  }

  /**
   * Get upload progress
   */
  getUploadProgress(fileId: string): UploadProgress | null {
    return uploadProgress.get(fileId) || null;
  }

  /**
   * Get all active uploads
   */
  getAllActiveUploads(): UploadProgress[] {
    return Array.from(uploadProgress.values()).filter(
      (progress) =>
        progress.status === "uploading" || progress.status === "processing",
    );
  }

  /**
   * Clean up completed uploads from memory
   */
  cleanupCompletedUploads(): void {
    for (const [fileId, progress] of uploadProgress.entries()) {
      if (progress.status === "completed" || progress.status === "error") {
        uploadProgress.delete(fileId);
      }
    }
  }

  /**
   * Get file versions
   */
  getFileVersions(originalName: string): UploadedFile[] {
    return fileVersions.get(originalName) || [];
  }

  /**
   * Delete file and its versions
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Find file in versions
      for (const [originalName, versions] of fileVersions.entries()) {
        const fileIndex = versions.findIndex((f) => f.id === fileId);
        if (fileIndex !== -1) {
          const file = versions[fileIndex];

          // Delete physical file
          await unlink(join(process.cwd(), "public", file.filePath));

          // Remove from versions
          versions.splice(fileIndex, 1);
          if (versions.length === 0) {
            fileVersions.delete(originalName);
          } else {
            fileVersions.set(originalName, versions);
          }

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("File deletion error:", error);
      return false;
    }
  }

  /**
   * Get file statistics
   */
  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    averageFileSize: number;
  }> {
    let totalFiles = 0;
    let totalSize = 0;
    const filesByType: Record<string, number> = {};

    for (const versions of fileVersions.values()) {
      for (const file of versions) {
        totalFiles++;
        totalSize += file.size;
        filesByType[file.mimeType] = (filesByType[file.mimeType] || 0) + 1;
      }
    }

    return {
      totalFiles,
      totalSize,
      filesByType,
      averageFileSize: totalFiles > 0 ? totalSize / totalFiles : 0,
    };
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FileUploadConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FileUploadConfig {
    return { ...this.config };
  }
}

export const enhancedFileUpload = EnhancedFileUploadService.getInstance();
