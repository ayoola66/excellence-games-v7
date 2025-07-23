/**
 * Questions upload API route.
 * Handles bulk upload of questions from CSV files and associates them with games.
 * Processes data in batches to optimise performance and maintain system stability.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

/**
 * Processes CSV file upload containing questions and creates them in the database.
 * 
 * @param request - The incoming request containing game ID and CSV file
 * @returns JSON response indicating upload success or error details
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const gameId = formData.get("gameId") as string;
    const file = formData.get("file") as File;

    if (!gameId || !file) {
      return NextResponse.json(
        { error: "Game ID and file are required" },
        { status: 400 }
      );
    }

    const strapiUrl =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
    const adminToken = cookies().get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch associated game details to verify existence and retrieve metadata
    let gameData;
    try {
      const gameResponse = await axios.get(`${strapiUrl}/api/games/${gameId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      gameData = gameResponse.data;
    } catch (error) {
      console.error("Error fetching game:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          return new NextResponse(error.response.data.error.message, {
            status: error.response.status,
          });
        }
      }
      return new NextResponse("Failed to fetch game details", { status: 500 });
    }

    // Retrieve the corresponding category ID based on the game's category
    let categoryId;
    try {
      const categoryResponse = await axios.get(
        `${strapiUrl}/api/categories`, {
          params: {
            'filters[name][$eq]': gameData.data.attributes.category
          },
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      categoryId = categoryResponse.data.data[0]?.id;
      if (!categoryId) {
        return new NextResponse("Category not found", { status: 404 });
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          return new NextResponse(error.response.data.error.message, {
            status: error.response.status,
          });
        }
      }
      return new NextResponse("Failed to fetch category details", { status: 500 });
    }

    // Transform CSV content into structured question objects
    // Format: question,answer,options (where options are semicolon-separated)
    const content = await file.text();
    const questions = content
      .split("\n")
      .slice(1) // Skip header row
      .filter(Boolean)
      .map((line) => {
        const [question, answer, options] = line
          .split(",")
          .map((s) => s.trim());
        return {
          question,
          answer,
          options: options.split(";").map((opt) => opt.trim()),
          game: gameId,
          category: categoryId,
        };
      });

    // Process questions in batches of 50 to optimise performance and prevent timeouts
    const batchSize = 50;
    try {
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        await axios.post(
          `${strapiUrl}/api/questions/batch`,
          { data: batch },
          {
            headers: {
              Authorization: `Bearer ${adminToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return NextResponse.json({ 
        success: true,
        message: `Successfully uploaded ${questions.length} questions`
      });
    } catch (error) {
      console.error("Error creating questions batch:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error) {
          return new NextResponse(error.response.data.error.message, {
            status: error.response.status,
          });
        }
      }
      return new NextResponse("Failed to create questions batch", { status: 500 });
    }
  } catch (error) {
    console.error("Error processing upload:", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Failed to process questions upload", { status: 500 });
  }
}
