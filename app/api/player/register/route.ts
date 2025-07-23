import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, firstName, lastName, password } =
      registerSchema.parse(body);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // In a real app, you'd use your database connection
    // For now, we'll simulate the database operation
    console.log("Registering player:", {
      email,
      username,
      firstName,
      lastName,
    });

    // Simulate database insert
    const playerId = crypto.randomUUID();

    // Generate JWT token
    const token = jwt.sign(
      { playerId, email, type: "player" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { playerId, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      { expiresIn: "7d" },
    );

    // Set cookies
    const response = NextResponse.json({
      success: true,
      player: {
        id: playerId,
        email,
        username,
        firstName,
        lastName,
      },
    });

    response.cookies.set("player_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    response.cookies.set("player_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Player registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
