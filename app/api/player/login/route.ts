import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // In a real app, you'd query your database
    // For local testing, we'll simulate a user lookup
    console.log("Player login attempt:", { email });

    // Simulate database lookup
    const mockPlayer = {
      id: crypto.randomUUID(),
      email,
      username: email.split("@")[0],
      firstName: "Test",
      lastName: "Player",
      passwordHash: await bcrypt.hash("password123", 10), // Default test password
    };

    // Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      mockPlayer.passwordHash,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // Generate tokens
    const token = jwt.sign(
      {
        playerId: mockPlayer.id,
        email: mockPlayer.email,
        type: "player",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    const refreshToken = jwt.sign(
      { playerId: mockPlayer.id, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
      { expiresIn: "7d" },
    );

    // Set cookies and return response
    const response = NextResponse.json({
      success: true,
      player: {
        id: mockPlayer.id,
        email: mockPlayer.email,
        username: mockPlayer.username,
        firstName: mockPlayer.firstName,
        lastName: mockPlayer.lastName,
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
    console.error("Player login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
