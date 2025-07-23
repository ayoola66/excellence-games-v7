import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {

    const filePath = path.join(process.cwd(), "data", "homepage.json");

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return NextResponse.json(JSON.parse(content));
    } catch (error) {
      // If file doesn't exist, return empty content
      return NextResponse.json({ content: "" });
    }
  } catch (error) {
    console.error("Error reading homepage content:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {

    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return new NextResponse("Invalid content", { status: 400 });
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "homepage.json");

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Save content to file
    await fs.writeFile(
      filePath,
      JSON.stringify({ content, updatedAt: new Date().toISOString() })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving homepage content:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
