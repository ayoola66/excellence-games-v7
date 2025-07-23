import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, handleAuthError } from "../utils/auth";
import adminApiClient from "@/lib/admin-api-client";

export async function GET(req: NextRequest) {
  const adminToken = getAdminToken();

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Please log in to continue", requiresAuth: true },
      { status: 401 }
    );
  }

  try {
    const stats = await adminApiClient.getDashboardStats(adminToken);
    return NextResponse.json(stats);
  } catch (error) {
    return handleAuthError(error);
  }
}
