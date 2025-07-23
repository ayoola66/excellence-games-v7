import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${STRAPI_URL}/api/questions?populate=game`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Strapi API Error for /questions: ${response.status}`,
        errorData
      );
      return NextResponse.json({ data: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching questions:", error.message);
    return NextResponse.json({ data: [] });
  }
}
