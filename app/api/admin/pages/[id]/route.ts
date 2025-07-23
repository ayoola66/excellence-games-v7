import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/pages/${params.id}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch page");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {

    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/pages/${params.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update page");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/pages/${params.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete page");
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting page:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
