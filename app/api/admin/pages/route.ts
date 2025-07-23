import { NextRequest, NextResponse } from "next/server";
import { getAdminToken, handleAuthError } from "../utils/auth";

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  const adminToken = getAdminToken();

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Please log in to continue", requiresAuth: true },
      { status: 401 }
    );
  }

  try {

    // Fetch pages from Strapi
    const response = await fetch(
      `${strapiUrl}/api/pages?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pages");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: NextRequest) {
  const adminToken = getAdminToken();

  if (!adminToken) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Please log in to continue", requiresAuth: true },
      { status: 401 }
    );
  }

  try {

    const body = await request.json();

    // Create page in Strapi
    const response = await fetch(
      `${strapiUrl}/api/pages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create page");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating page:", error);
    return handleAuthError(error);
  }
}
