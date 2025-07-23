import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query parameters
    let queryParams = `pagination[page]=${page}&pagination[pageSize]=${limit}&sort=${sortBy}:${sortOrder}`;

    // Add search filter if provided
    if (search) {
      queryParams += `&filters[$or][0][email][$containsi]=${encodeURIComponent(search)}`;
      queryParams += `&filters[$or][1][firstName][$containsi]=${encodeURIComponent(search)}`;
      queryParams += `&filters[$or][2][lastName][$containsi]=${encodeURIComponent(search)}`;
      queryParams += `&filters[$or][3][username][$containsi]=${encodeURIComponent(search)}`;
    }

    const response = await fetch(`${STRAPI_URL}/api/users?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Users API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform the data to include pagination info
    const result = {
      users: data.data || data,
      pagination: {
        page: data.meta?.pagination?.page || page,
        pageSize: data.meta?.pagination?.pageSize || limit,
        pageCount: data.meta?.pagination?.pageCount || 1,
        total: data.meta?.pagination?.total || data.length || 0,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      playerSubscription = "Free",
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Create user via Strapi
    const response = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        email,
        password,
        firstName,
        lastName,
        playerSubscription,
        confirmed: true,
        blocked: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to create user" },
        { status: response.status },
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
