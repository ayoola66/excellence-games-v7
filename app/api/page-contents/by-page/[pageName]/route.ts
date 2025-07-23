import { NextRequest, NextResponse } from "next/server";
import { adminApiClient } from "@/lib/admin-api-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/page-contents/by-page/${params.pageName}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch page content");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { pageName: string } }
) {
  try {
    const body = await request.json();
    const response = await adminApiClient.put(
      `/api/page-contents/by-page/${params.pageName}`,
      body
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating page content:", error);
    return NextResponse.json(
      { error: "Failed to update page content" },
      { status: 500 }
    );
  }
}
