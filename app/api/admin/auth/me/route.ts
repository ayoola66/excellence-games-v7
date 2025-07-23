import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await adminAuth.getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
