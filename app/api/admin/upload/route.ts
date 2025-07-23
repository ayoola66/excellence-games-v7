import { NextRequest, NextResponse } from "next/server";
import { enhancedAuth } from "@/lib/enhanced-auth";
import { enhancedFileUpload } from "@/lib/enhanced-file-upload";
import {
  ErrorCodes,
  ErrorMessages,
  createAuthError,
  createFileUploadError,
} from "@/lib/error-utils";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Validate user
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "general";
    const metadata = formData.get("metadata")
      ? JSON.parse(formData.get("metadata") as string)
      : {};

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Handle single file upload
    if (files.length === 1) {
      try {
        const uploadedFile = await enhancedFileUpload.uploadFile(files[0], {
          category,
          metadata: { ...metadata, uploadedBy: user.id },
        });

        return NextResponse.json({
          success: true,
          file: uploadedFile,
          message: "File uploaded successfully",
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("size exceeds")) {
          throw createFileUploadError(ErrorCodes.FILE_TOO_LARGE, files[0].name);
        }
        if (errorMessage.includes("not allowed")) {
          throw createFileUploadError(
            ErrorCodes.INVALID_FILE_TYPE,
            files[0].name,
          );
        }

        throw createFileUploadError(ErrorCodes.UPLOAD_FAILED, files[0].name);
      }
    }

    // Handle multiple file upload
    const uploadResult = await enhancedFileUpload.uploadMultipleFiles(files, {
      category,
      metadata: { ...metadata, uploadedBy: user.id },
      maxConcurrent: 3,
    });

    return NextResponse.json({
      success: uploadResult.success,
      uploadedFiles: uploadResult.uploadedFiles,
      errors: uploadResult.errors,
      summary: {
        totalFiles: uploadResult.totalFiles,
        successCount: uploadResult.successCount,
        errorCount: uploadResult.errorCount,
      },
      message: uploadResult.success
        ? "All files uploaded successfully"
        : `${uploadResult.successCount} of ${uploadResult.totalFiles} files uploaded successfully`,
    });
  } catch (error) {
    console.error("File upload error:", error);

    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).statusCode },
      );
    }

    return NextResponse.json(
      { error: ErrorMessages.UPLOAD_FAILED },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Validate user
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "progress") {
      // Get upload progress for all active uploads
      const activeUploads = enhancedFileUpload.getAllActiveUploads();
      return NextResponse.json({ activeUploads });
    }

    if (action === "stats") {
      // Get file statistics
      const fileStats = await enhancedFileUpload.getFileStats();
      const config = enhancedFileUpload.getConfig();

      return NextResponse.json({
        fileStats,
        config: {
          maxFileSize: config.maxFileSize,
          allowedTypes: config.allowedTypes,
          enableCompression: config.enableCompression,
          enableVersioning: config.enableVersioning,
        },
      });
    }

    if (action === "versions") {
      const fileName = searchParams.get("fileName");
      if (!fileName) {
        return NextResponse.json(
          { error: "File name is required" },
          { status: 400 },
        );
      }

      const versions = enhancedFileUpload.getFileVersions(fileName);
      return NextResponse.json({ versions });
    }

    return NextResponse.json(
      { error: "Invalid action parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("File upload GET error:", error);

    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).statusCode },
      );
    }

    return NextResponse.json(
      { error: ErrorMessages.INTERNAL_ERROR },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Validate user
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 },
      );
    }

    const deleted = await enhancedFileUpload.deleteFile(fileId);

    if (!deleted) {
      throw createFileUploadError(ErrorCodes.FILE_NOT_FOUND);
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      fileId,
    });
  } catch (error) {
    console.error("File deletion error:", error);

    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).statusCode },
      );
    }

    return NextResponse.json(
      { error: ErrorMessages.INTERNAL_ERROR },
      { status: 500 },
    );
  }
}
