import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export async function GET() {
  const session = await getSession();

  // 1. Check for a valid admin session
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch games from Strapi using the admin token
    const response = await fetch(`${STRAPI_URL}/api/games?populate=category`, {
      method: "GET", // Explicitly set method for clarity
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      cache: "no-store", // Ensure fresh data is fetched every time
    });

    // Even if the request is "ok", a 403 Forbidden is still a failed request.
    // We handle it gracefully instead of throwing an error.
    if (!response.ok) {
      const errorData = await response.text();
      console.error(
        `Strapi API Error for /games: ${response.status}`,
        errorData
      );
      // Return an empty array, which the frontend can handle.
      return NextResponse.json({ data: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    // Return a more detailed error message
    console.error("Error fetching games:", error.message);
    // On a catch, also return an empty array.
    return NextResponse.json({ data: [] });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    console.error(
      "Unauthorized attempt to create game - no valid admin session"
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;

    // Get the thumbnail file, which could be named either "thumbnail" or "image"
    let thumbnailFile = formData.get("thumbnail") as File;
    if (!thumbnailFile || thumbnailFile.size === 0) {
      thumbnailFile = formData.get("image") as File;
    }

    console.log("Game creation request received:", {
      name,
      description,
      type,
      status,
      thumbnailFile: thumbnailFile
        ? `${thumbnailFile.name} (${thumbnailFile.size} bytes)`
        : "none",
    });

    // Upload thumbnail if provided
    let imageId = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      console.log("Uploading thumbnail...");
      const uploadFormData = new FormData();
      uploadFormData.append("files", thumbnailFile);

      const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
        },
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Thumbnail upload error:", errorText);
        throw new Error("Failed to upload thumbnail");
      }

      const uploadResult = await uploadResponse.json();
      imageId = uploadResult[0].id;
      console.log("Thumbnail uploaded successfully, ID:", imageId);
    }

    // Create the game first
    const gameData = {
      data: {
        name,
        description,
        type,
        status,
        isActive: status === "PUBLISHED",
        isPremium: false, // Default to false, can be updated later
        ...(imageId && { imageUrl: imageId }), // This is the correct field name in the Strapi schema
      },
    };

    console.log("Creating game with data:", JSON.stringify(gameData));

    // Log the token being used (first 5 chars only for security)
    if (STRAPI_ADMIN_TOKEN) {
      console.log(
        "Using token with prefix:",
        STRAPI_ADMIN_TOKEN.substring(0, 5) + "..."
      );
      console.log("Token length:", STRAPI_ADMIN_TOKEN.length);
    } else {
      console.error("STRAPI_ADMIN_TOKEN is not set!");
    }

    const gameResponse = await fetch(`${STRAPI_URL}/api/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
      body: JSON.stringify(gameData),
    });

    // Log the full response for debugging
    const responseText = await gameResponse.text();
    console.log("Game creation response status:", gameResponse.status);
    console.log("Game creation response:", responseText);

    // Parse the response again since we consumed it with .text()
    let gameResult;
    try {
      gameResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid response from API");
    }

    if (!gameResponse.ok) {
      console.error("Game creation error:", responseText);

      // Check if it's an authentication issue
      if (gameResponse.status === 401 || gameResponse.status === 403) {
        console.error(
          "Authentication error - STRAPI_ADMIN_TOKEN might be invalid"
        );
      }

      throw new Error("Failed to create game");
    }

    const gameId = gameResult.data.id;
    console.log("Game created successfully, ID:", gameId);

    // For nested games, create categories after game is created
    if (type === "NESTED") {
      console.log("Creating categories for nested game...");
      // Get all category names from form data
      const categoryNames = [];
      for (let i = 0; i < 5; i++) {
        const categoryName = formData.get(`categories[${i}]`);
        if (!categoryName) {
          throw new Error(
            `Category ${i + 1} name is required for nested games`
          );
        }
        categoryNames.push(categoryName);
      }

      console.log("Category names:", categoryNames);

      // Create all categories in parallel
      const categoryPromises = categoryNames.map((name, index) => {
        console.log(`Creating category ${index + 1}: ${name}`);
        return fetch(`${STRAPI_URL}/api/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              name,
              cardNumber: index + 1, // Required field in schema
              isActive: status === "PUBLISHED",
              game: gameId, // Link to the created game
            },
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.text();
            console.error(`Failed to create category ${index + 1}:`, error);
            throw new Error(`Failed to create category ${index + 1}`);
          }
          const result = await res.json();
          console.log(
            `Category ${index + 1} created successfully, ID:`,
            result.data.id
          );
          return result;
        });
      });

      try {
        // Wait for all categories to be created
        await Promise.all(categoryPromises);
        console.log("All categories created successfully");
      } catch (error) {
        console.error("Error creating categories:", error);
        // Even if categories fail, we've already created the game
        // Return success with a warning
        return NextResponse.json({
          data: gameResult.data,
          warning: "Game created but some categories may have failed to create",
        });
      }
    }

    return NextResponse.json(gameResult);
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
