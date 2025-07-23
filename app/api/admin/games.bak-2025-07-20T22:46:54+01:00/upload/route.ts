import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import * as XLSX from "xlsx";

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

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

    const adminToken = cookies().get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch associated game details to verify existence and determine type
    let gameData;
    try {
      const gameResponse = await axios.get(
        `${strapiUrl}/api/games/${gameId}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      gameData = gameResponse.data.data;
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

    const gameType = gameData.attributes.type;
    const draftAndPublish = gameData.attributes.draftAndPublish;
    const isMultiSheet = gameType === "NESTED";
    
    // Process file content based on file type and game type
    const content = await file.arrayBuffer();
    const workbook = XLSX.read(content);
    const questions = [];
    
    if (isMultiSheet) {
      // For NESTED type, process each sheet as a category
      for (const sheetName of workbook.SheetNames) {
        // Get or create category based on sheet name
        let categoryId;
        try {
          const categoryResponse = await axios.get(
            `${strapiUrl}/api/categories?filters[name][$eq]=${encodeURIComponent(sheetName)}`,
            {
              headers: {
                Authorization: `Bearer ${adminToken}`,
              },
            }
          );
          
          if (categoryResponse.data.data.length === 0) {
            // Create new category if it doesn't exist
            const newCategoryResponse = await axios.post(
              `${strapiUrl}/api/categories`,
              {
                data: {
                  name: sheetName,
                  games: [gameId]
                }
              },
              {
                headers: {
                  Authorization: `Bearer ${adminToken}`,
                }
              }
            );
            categoryId = newCategoryResponse.data.data.id;
          } else {
            categoryId = categoryResponse.data.data[0].id;
            // Link category to game if not already linked
            await axios.put(
              `${strapiUrl}/api/categories/${categoryId}`,
              {
                data: {
                  games: {
                    connect: [gameId]
                  }
                }
              },
              {
                headers: {
                  Authorization: `Bearer ${adminToken}`,
                }
              }
            );
          }
        } catch (error) {
          console.error(`Error processing category ${sheetName}:`, error);
          continue;
        }

        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        // Process questions from this sheet/category
        for (const row of sheetData) {
          const options = [
            row.option1,
            row.option2,
            row.option3,
            row.option4
          ].filter(Boolean);
          
          questions.push({
            question: row.question,
            options,
            correctOption: parseInt(row.correctOption, 10) - 1, // Convert to 0-based index
            category: categoryId,
            game: gameId,
            ...(draftAndPublish && { publishedAt: new Date() })
          });
        }
      }
    } else {
      // For STRAIGHT type, process single sheet and use game's first category
      let categoryId;
      try {
        const categoryId = gameData.attributes.categories.data[0]?.id;
        if (!categoryId) {
          return new NextResponse("Game has no associated category", { status: 400 });
        }
      } catch (error) {
        console.error("Error getting category for straight game:", error);
        return new NextResponse("Failed to get game category", { status: 500 });
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process questions from the sheet
      for (const row of sheetData) {
        const options = [
          row.option1,
          row.option2,
          row.option3,
          row.option4
        ].filter(Boolean);
        
        questions.push({
          question: row.question,
          options,
          correctOption: parseInt(row.correctOption, 10) - 1, // Convert to 0-based index
          category: categoryId,
          game: gameId,
          ...(draftAndPublish && { publishedAt: new Date() })
        });
      }
    }

    // Use Strapi bulk create endpoint with populate
    try {
      const response = await axios.post(
        `${strapiUrl}/api/questions/batch?populate=*`,
        { data: questions },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

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
