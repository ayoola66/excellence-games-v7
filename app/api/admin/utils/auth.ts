import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function getAdminToken() {
  const cookieStore = cookies();
  const adminToken = cookieStore.get("admin_token");

  if (!adminToken?.value) {
    return null;
  }

  return adminToken.value;
}

export function handleAuthError(error: any) {
  console.error("Auth error:", error);
  if (!error.response) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const status = error.response.status;
  
  if (status === 401 || status === 403) {
    // Clear admin token cookie
    cookies().delete("admin_token");
    
    return NextResponse.json(
      { 
        error: "Authentication failed",
        message: "Please re-authenticate to continue",
        requiresAuth: true 
      },
      { status }
    );
  }

  // Handle other errors
  return NextResponse.json(
    { 
      error: "Request failed",
      message: error.response?.data?.error?.message || "An error occurred",
    },
    { status: error.response.status || 500 }
  );
}
