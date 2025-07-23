import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import FormData from "form-data";

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const sort = searchParams.get("sort") || "createdAt:desc";
    const filters = searchParams.get("filters");

    // Build query parameters
    const queryParams = new URLSearchParams({
      "pagination[page]": page,
      "pagination[pageSize]": pageSize,
      sort,
      populate: "*",
    });

    // Add filters if present
    if (filters) {
      queryParams.append("filters", filters);
    }

    const response = await axios.get(
      `${strapiUrl}/api/games?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${adminToken.value}` },
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching games:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
      // If it's a Strapi error, return the error message
      if (error.response?.data?.error) {
        return new NextResponse(error.response.data.error.message, {
          status: error.response.status,
        });
      }
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("files.image") as File;
    const data = formData.get("data");

    // First upload the image if it exists
    let imageId;
    if (imageFile) {
      const imageFormData = new FormData();
      const buffer = await imageFile.arrayBuffer();
      imageFormData.append("files", Buffer.from(buffer), imageFile.name);

      const uploadResponse = await axios.post(
        `${strapiUrl}/api/upload`,
        imageFormData,
        {
          headers: {
            Authorization: `Bearer ${adminToken.value}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      imageId = uploadResponse.data[0].id;
    }

    // Then create the game with the image reference
    const gameData = data ? JSON.parse(data as string) : {};
    if (imageId) {
      gameData.imageUrl = imageId;
    }

    // Convert type to uppercase
    if (gameData.type) {
      gameData.type = gameData.type.toUpperCase();
    }

    const response = await axios.post(
      `${strapiUrl}/api/games`,
      { data: gameData },
      {
        headers: {
          Authorization: `Bearer ${adminToken.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error creating game:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
