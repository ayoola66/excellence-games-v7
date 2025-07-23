"use client";

import { useState } from "react";
import { EnhancedFileUpload } from "@/components/admin/enhanced-file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function TestUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState<
    Array<{ fileName: string; error: string }>
  >([]);
  const [uploadStats, setUploadStats] = useState<any>(null);

  const handleUploadComplete = (files: UploadedFile[]) => {
    console.log("Upload completed:", files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleUploadError = (
    errors: Array<{ fileName: string; error: string }>,
  ) => {
    console.log("Upload errors:", errors);
    setUploadErrors((prev) => [...prev, ...errors]);
  };

  const fetchUploadStats = async () => {
    try {
      const response = await fetch("/api/admin/upload?action=stats");
      const data = await response.json();
      setUploadStats(data);
    } catch (error) {
      console.error("Failed to fetch upload stats:", error);
    }
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setUploadErrors([]);
    setUploadStats(null);
  };

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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">File Upload Test</h1>
        <p className="text-gray-600">
          Test the enhanced file upload system for admin dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Component */}
        <div>
          <EnhancedFileUpload
            category="test"
            maxFiles={5}
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Results and Stats */}
        <div className="space-y-4">
          {/* Upload Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upload Statistics
                <Button onClick={fetchUploadStats} variant="outline" size="sm">
                  Refresh Stats
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadStats ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <Badge>{uploadStats.fileStats.totalFiles}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Size:</span>
                    <Badge>
                      {formatFileSize(uploadStats.fileStats.totalSize)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Size:</span>
                    <Badge>
                      {formatFileSize(uploadStats.fileStats.averageFileSize)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Max File Size:</span>
                    <Badge variant="outline">
                      {formatFileSize(uploadStats.config.maxFileSize)}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Files by Type:</p>
                    <div className="space-y-1">
                      {Object.entries(uploadStats.fileStats.filesByType).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between text-sm"
                          >
                            <span>{type}:</span>
                            <span>{count}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Click "Refresh Stats" to load statistics
                </p>
              )}
            </CardContent>
          </Card>

          {/* Successfully Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Successfully Uploaded ({uploadedFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)} • {file.mimeType}
                          </p>
                          <p className="text-xs text-gray-400">
                            Path: {file.filePath}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {file.compressed && (
                            <Badge variant="outline" className="text-xs">
                              Compressed
                            </Badge>
                          )}
                          {file.version && (
                            <Badge variant="outline" className="text-xs">
                              v{file.version}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">
                  Upload Errors ({uploadErrors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadErrors.map((error, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-800">
                        {error.fileName}
                      </p>
                      <p className="text-sm text-red-600">{error.error}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clear All Button */}
          {(uploadedFiles.length > 0 || uploadErrors.length > 0) && (
            <Button onClick={clearAll} variant="outline" className="w-full">
              Clear All Results
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
