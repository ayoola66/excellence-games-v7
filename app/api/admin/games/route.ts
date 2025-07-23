import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "../utils/auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(req: NextRequest) {
  const adminToken = getAdminToken();

  if (!adminToken) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Please log in to continue",
        requiresAuth: true,
      },
      { status: 401 },
    );
  }

  try {
    // Use the Frontend_Admin user token for API access
    const response = await fetch(`${STRAPI_URL}/api/games?populate=category`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Strapi API Error for /games: ${response.status}`,
        errorData,
      );
      return NextResponse.json({ data: [] });
    }

    const data = await response.json();

    // Transform Strapi response to match frontend Game interface
    if (data.data && Array.isArray(data.data)) {
      const transformedGames = data.data.map((game: any) => ({
        ...game,
        title: game.name, // Map Strapi 'name' to frontend 'title'
        thumbnail: game.imageUrl ? `${STRAPI_URL}${game.imageUrl}` : undefined,
      }));

      return NextResponse.json({
        ...data,
        data: transformedGames,
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching games:", error.message);
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: NextRequest) {
  console.log("=== POST /api/admin/games called ===");

  const adminToken = getAdminToken();
  console.log(
    "Admin token retrieved:",
    adminToken ? `${adminToken.substring(0, 10)}...` : "null",
  );

  if (!adminToken) {
    console.log("No admin token - returning 401");
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Please log in to continue",
        requiresAuth: true,
      },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();

    // Log form data for debugging
    console.log("Form data received:", {
      fields: Array.from(formData.entries()).map(([key, value]) =>
        value instanceof File
          ? `${key}: File(${value.name}, ${value.size} bytes)`
          : `${key}: ${value}`,
      ),
    });

    // Extract form data fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;
    const isActive = formData.get("isActive") === "true";
    const isPremium = formData.get("isPremium") === "true";
    const thumbnailFile = formData.get("thumbnail") as File | null;

    // Extract nested game categories
    const categories: string[] = [];
    if (type === "NESTED") {
      for (let i = 1; i <= 5; i++) {
        const category = formData.get(`category${i}`) as string;
        if (category && category.trim()) {
          categories.push(category.trim());
        }
      }
    }

    console.log("Extracted fields:", {
      title,
      description,
      type,
      status,
      isActive,
      isPremium,
      categories,
      hasImage: !!thumbnailFile,
    });

    // Validate required fields
    if (!title || !description || !type || !status) {
      console.log("Missing required fields - returning 400");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Handle image upload first if provided
    let imageUrl = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("Uploading thumbnail...");
      const uploadFormData = new FormData();
      uploadFormData.append("files", thumbnailFile);

      console.log("Making upload request to Strapi...");
      const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: uploadFormData,
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Thumbnail upload error:", errorText);
        console.log("Continuing with game creation without image...");
      } else {
        const uploadResult = await uploadResponse.json();
        // Get the URL of the uploaded image
        imageUrl = uploadResult[0].url;
        console.log("Thumbnail uploaded successfully, URL:", imageUrl);
      }
    }

    // Prepare game data for Strapi
    const gameData = {
      data: {
        name: title,
        description,
        type,
        status,
        isActive,
        isPremium,
        // Add nested game categories
        ...(type === "NESTED" &&
          categories.length > 0 && {
            category1: categories[0] || "",
            category2: categories[1] || "",
            category3: categories[2] || "",
            category4: categories[3] || "",
            category5: categories[4] || "",
          }),
        // Use the full URL from the upload response
        ...(imageUrl && { imageUrl: `${STRAPI_URL}${imageUrl}` }),
      },
    };

    console.log("Creating game with data:", JSON.stringify(gameData, null, 2));

    // Create the game in Strapi
    const gameResponse = await fetch(`${STRAPI_URL}/api/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(gameData),
    });

    console.log("Game creation response status:", gameResponse.status);

    if (!gameResponse.ok) {
      const errorText = await gameResponse.text();
      console.error("Game creation error:", errorText);
      return NextResponse.json(
        { error: "Failed to create game", details: errorText },
        { status: gameResponse.status },
      );
    }

    const game = await gameResponse.json();
    return NextResponse.json(game);
  } catch (error: any) {
    console.error("Error in game creation:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
