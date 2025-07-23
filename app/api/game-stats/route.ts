import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import axios from "axios";

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.jwt) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await axios.get(`${strapiUrl}/api/game-stats`, {
      headers: {
        Authorization: `Bearer ${session.jwt}`,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching game stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch game stats" },
      { status: 500 }
    );
  }
}
