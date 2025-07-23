"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  error?: string;
}

interface UploadedFile {
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

interface EnhancedFileUploadProps {
  category?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (errors: Array<{ fileName: string; error: string }>) => void;
  className?: string;
}

export function EnhancedFileUpload({
  category = "general",
  maxFiles = 10,
  acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/json",
    "text/plain",
  ],
  onUploadComplete,
  onUploadError,
  className = "",
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Map<string, UploadProgress>
  >(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<
    Array<{ fileName: string; error: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (
      mimeType.includes("csv") ||
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet")
    ) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`,
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size ${formatFileSize(file.size)} exceeds maximum limit of ${formatFileSize(maxSize)}`,
      };
    }

    return { valid: true };
  };

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: File[] = [];
      const newErrors: Array<{ fileName: string; error: string }> = [];

      Array.from(selectedFiles).forEach((file) => {
        const validation = validateFile(file);
        if (validation.valid) {
          newFiles.push(file);
        } else {
          newErrors.push({ fileName: file.name, error: validation.error! });
        }
      });

      // Check total file limit
      if (files.length + newFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files at once`);
        return;
      }

      setFiles((prev) => [...prev, ...newFiles]);
      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }
    },
    [files.length, maxFiles, acceptedTypes],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(new Map());
    setUploadedFiles([]);
    setErrors([]);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("category", category);
      formData.append("metadata", JSON.stringify({ uploadedAt: Date.now() }));

      // Create progress tracking for each file
      const progressMap = new Map<string, UploadProgress>();
      files.forEach((file, index) => {
        const fileId = `file-${index}`;
        progressMap.set(fileId, {
          fileId,
          fileName: file.name,
          progress: 0,
          status: "uploading",
        });
      });
      setUploadProgress(progressMap);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        if (result.file) {
          // Single file upload
          setUploadedFiles([result.file]);
          onUploadComplete?.([result.file]);
          toast.success("File uploaded successfully");
        } else {
          // Multiple file upload
          setUploadedFiles(result.uploadedFiles);
          onUploadComplete?.(result.uploadedFiles);

          if (result.errors && result.errors.length > 0) {
            setErrors(result.errors);
            onUploadError?.(result.errors);
            toast.warning(
              `${result.summary.successCount} of ${result.summary.totalFiles} files uploaded successfully`,
            );
          } else {
            toast.success("All files uploaded successfully");
          }
        }

        // Clear files after successful upload
        setFiles([]);
      } else {
        if (result.errors) {
          setErrors(result.errors);
          onUploadError?.(result.errors);
        }
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Enhanced File Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: Images, CSV, Excel, JSON, Text files (max 10MB each)
            </p>
            <Button variant="outline" disabled={isUploading}>
              Select Files
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Selected Files */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Files ({files.length})</span>
              <Button
                onClick={uploadFiles}
                disabled={isUploading}
                className="ml-auto"
              >
                {isUploading ? "Uploading..." : "Upload Files"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {uploadProgress.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(uploadProgress.values()).map((progress) => (
                <div key={progress.fileId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {progress.fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          progress.status === "completed"
                            ? "default"
                            : progress.status === "error"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {progress.status}
                      </Badge>
                      {progress.status === "completed" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {progress.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={progress.progress} className="h-2" />
                  {progress.error && (
                    <p className="text-sm text-red-500">{progress.error}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Successfully Uploaded ({uploadedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.mimeType)}
                    <div>
                      <p className="font-medium">{file.originalName}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {file.compressed && (
                          <Badge variant="outline">Compressed</Badge>
                        )}
                        {file.version && (
                          <Badge variant="outline">v{file.version}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Uploaded</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Upload errors:</p>
              {errors.map((error, index) => (
                <p key={index} className="text-sm">
                  <strong>{error.fileName}:</strong> {error.error}
                </p>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearErrors}
              className="mt-2"
            >
              Clear Errors
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
