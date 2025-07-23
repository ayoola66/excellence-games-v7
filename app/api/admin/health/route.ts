import { NextResponse } from "next/server";

export async function GET() {
  try {
    const STRAPI_URL =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

    // Check if Strapi is accessible
    const strapiResponse = await fetch(`${STRAPI_URL}/api/admin/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const isStrapiHealthy = strapiResponse.status !== 500;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        strapi: isStrapiHealthy ? "healthy" : "unhealthy",
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
