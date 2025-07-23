import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    const strapiUrl =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
    const token = cookies().get("next-auth.session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const userResponse = await fetch(`${strapiUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = await userResponse.json();

    // Update user data
    const updateData: any = {};
    if (name) updateData.username = name;
    if (email) updateData.email = email;
    if (currentPassword && newPassword) {
      // Verify current password
      const verifyResponse = await fetch(`${strapiUrl}/api/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: userData.email,
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      updateData.password = newPassword;
    }

    // Update user
    const updateResponse = await fetch(
      `${strapiUrl}/api/users/${userData.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "Failed to update user settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
