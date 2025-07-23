import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const response = await axios.get(`${strapiUrl}/api/settings`, {
      headers: { Authorization: `Bearer ${adminToken.value}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const response = await axios.put(
      `${strapiUrl}/api/settings`,
      { data: body },
      {
        headers: {
          Authorization: `Bearer ${adminToken.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
