import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string(),
  timeTaken: z.number().min(0).optional(),
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Verify player authentication
    const playerData = verifyPlayerToken(request);

    const sessionId = params.id;
    const body = await request.json();
    const { questionId, answer, timeTaken = 0 } = answerSchema.parse(body);

    console.log("Processing answer:", {
      sessionId,
      questionId,
      answer,
      timeTaken,
      playerId: playerData.playerId,
    });

    // In a real app, you'd:
    // 1. Verify the session belongs to the player
    // 2. Check if the question is the current question
    // 3. Validate the answer against the correct answer
    // 4. Update the session score and progress
    // 5. Save the answer to the database

    // Mock answer validation
    const isCorrect = answer.toLowerCase() === "paris"; // Mock correct answer
    const pointsEarned = isCorrect ? 10 : 0;

    // Mock session update
    const updatedSession = {
      id: sessionId,
      currentQuestionIndex: 1, // Move to next question
      score: pointsEarned,
      status: "active",
    };

    // Mock next question (or game completion)
    const nextQuestion =
      updatedSession.currentQuestionIndex < 10
        ? {
            id: crypto.randomUUID(),
            text: "Which planet is known as the Red Planet?",
            options: ["Venus", "Mars", "Jupiter", "Saturn"],
            type: "multiple_choice",
            timeLimit: 30,
          }
        : null;

    const response = {
      success: true,
      isCorrect,
      pointsEarned,
      totalScore: updatedSession.score,
      nextQuestion,
      questionNumber: updatedSession.currentQuestionIndex + 1,
      totalQuestions: 10,
      gameCompleted: !nextQuestion,
    };

    if (!nextQuestion) {
      // Game completed
      response.finalScore = updatedSession.score;
      response.gameCompleted = true;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Answer processing error:", error);

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
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
