/**
 * Game management API routes for administrative operations.
 * Provides endpoints for updating and removing games from the system.
 * Requires administrative authentication via token.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import FormData from "form-data";

// Base URL for Strapi CMS API endpoints
const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Determine whether the client sent multipart/form-data or JSON
    const contentType = req.headers.get("content-type") ?? "";

    if (contentType.startsWith("multipart/form-data")) {
      // ----- multipart branch (image + data) -----
      const formData = await req.formData();
      const imageFile = formData.get("files.image") as File | null;
      const dataString = formData.get("data") as string | null;
      const gamePayload = dataString ? JSON.parse(dataString) : {};

      // If a new image is provided, upload it first
      if (imageFile) {
        const uploadFormData = new FormData();
        const buffer = await imageFile.arrayBuffer();
        uploadFormData.append("files", Buffer.from(buffer), imageFile.name);

        const uploadRes = await axios.post(
          `${strapiUrl}/api/upload`,
          uploadFormData,
          {
            headers: {
              Authorization: `Bearer ${adminToken.value}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const imageId = uploadRes.data[0]?.id;
        gamePayload.imageUrl = imageId;
      }

      // Ensure enum casing
      if (gamePayload.type) {
        gamePayload.type = gamePayload.type.toUpperCase();
      }

      const response = await axios.put(
        `${strapiUrl}/api/games/${params.id}`,
        { data: gamePayload },
        {
          headers: {
            Authorization: `Bearer ${adminToken.value}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data;
      return NextResponse.json({
        data: responseData.data || responseData
      });
    }

    // ----- JSON branch -----
    const jsonBody = await req.json();
    const response = await axios.put(
      `${strapiUrl}/api/games/${params.id}`,
      jsonBody,
      {
        headers: { Authorization: `Bearer ${adminToken.value}` },
      }
    );
    const responseData = response.data;
    return NextResponse.json({
      data: responseData.data || responseData
    });
  } catch (error) {
    console.error(`Error updating game ${params.id}:`, error);
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      return new NextResponse(error.response.data.error.message, {
        status: error.response.status,
      });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Removes a game from the system.
 *
 * @param req - The incoming request
 * @param params - Route parameters containing the game ID
 * @returns Empty response on successful deletion or error message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await axios.delete(`${strapiUrl}/api/games/${params.id}`, {
      headers: { Authorization: `Bearer ${adminToken.value}` },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting game ${params.id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
