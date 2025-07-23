import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

const startGameSchema = z.object({
  gameId: z.string().uuid(),
});

// Helper function to verify player token
function verifyPlayerToken(request: NextRequest) {
  const token = request.cookies.get("player_token")?.value;

  if (!token) {
    throw new Error("No authentication token");
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    ) as any;

    if (decoded.type !== "player") {
      throw new Error("Invalid token type");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify player authentication
    const playerData = verifyPlayerToken(request);

    const body = await request.json();
    const { gameId } = startGameSchema.parse(body);

    // In a real app, you'd:
    // 1. Verify the game exists and is active
    // 2. Get the game's questions
    // 3. Create a new game session in the database

    console.log("Starting game session:", {
      gameId,
      playerId: playerData.playerId,
    });

    // Simulate game session creation
    const sessionId = crypto.randomUUID();
    const mockGameSession = {
      id: sessionId,
      gameId,
      playerId: playerData.playerId,
      status: "active",
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 10, // Mock value
      startedAt: new Date().toISOString(),
    };

    // Simulate getting the first question
    const mockFirstQuestion = {
      id: crypto.randomUUID(),
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      type: "multiple_choice",
      timeLimit: 30, // seconds
    };

    return NextResponse.json({
      success: true,
      session: mockGameSession,
      currentQuestion: mockFirstQuestion,
      questionNumber: 1,
      totalQuestions: mockGameSession.totalQuestions,
    });
  } catch (error) {
    console.error("Game start error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }

    if (
      error.message.includes("token") ||
      error.message.includes("authentication")
    ) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 },
    );
  }
}
