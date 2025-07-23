/**
 * Game management API routes for administrative operations.
 * Provides endpoints for updating and removing games from the system.
 * Requires administrative authentication via token.
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/admin-auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await adminAuth.getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    if (!adminAuth.canManageGames(user)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const gameId = parseInt(params.id);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const token = adminAuth.getAdminToken(request);
    const response = await fetch(
      `${STRAPI_URL}/api/games/${gameId}?populate=category`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to fetch game" },
        { status: response.status }
      );
    }

    const game = await response.json();

    // Transform Strapi response to match frontend interface
    const transformedGame = {
      ...game.data,
      title: game.data.name,
      thumbnail: game.data.imageUrl
        ? `${STRAPI_URL}${game.data.imageUrl}`
        : undefined,
    };

    return NextResponse.json(transformedGame);
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await adminAuth.getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    if (!adminAuth.canManageGames(user)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const gameId = parseInt(params.id);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const formData = await request.formData();
    const token = adminAuth.getAdminToken(request);

    // Handle image upload if provided
    let imageUrl = null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (thumbnailFile && thumbnailFile.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append("files", thumbnailFile);

      const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult[0].url;
      }
    }

    // Prepare game data for Strapi
    const gameData: any = {
      data: {},
    };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;
    const isActive = formData.get("isActive") as string;
    const isPremium = formData.get("isPremium") as string;

    if (title) gameData.data.name = title;
    if (description) gameData.data.description = description;
    if (type) gameData.data.type = type;
    if (status) gameData.data.status = status;
    if (isActive !== null) gameData.data.isActive = isActive === "true";
    if (isPremium !== null) gameData.data.isPremium = isPremium === "true";
    if (imageUrl) gameData.data.imageUrl = `${STRAPI_URL}${imageUrl}`;

    const response = await fetch(`${STRAPI_URL}/api/games/${gameId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(gameData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Game update error:", errorText);
      return NextResponse.json(
        { error: "Failed to update game", details: errorText },
        { status: response.status }
      );
    }

    const updatedGame = await response.json();

    // Transform response
    const transformedGame = {
      ...updatedGame.data,
      title: updatedGame.data.name,
      thumbnail: updatedGame.data.imageUrl
        ? `${STRAPI_URL}${updatedGame.data.imageUrl}`
        : undefined,
    };

    return NextResponse.json(transformedGame);
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await adminAuth.getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to continue" },
        { status: 401 }
      );
    }

    if (!adminAuth.canManageGames(user)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const gameId = parseInt(params.id);
    if (isNaN(gameId)) {
      return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    const token = adminAuth.getAdminToken(request);
    const response = await fetch(`${STRAPI_URL}/api/games/${gameId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to delete game" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
