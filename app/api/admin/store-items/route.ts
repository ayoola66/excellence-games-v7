import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminApiClient } from "@/lib/admin-api-client";

interface StrapiError {
  error: {
    status: number;
    message: string;
    [k: string]: unknown;
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await adminApiClient.get("/store-items");
    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      const strapiError = error.response.data as StrapiError;
      const strapiMsg =
        strapiError?.error?.message ?? "Unknown Strapi error";
      console.error("Strapi error", error.response.status, strapiMsg);
      return new NextResponse(JSON.stringify({ message: strapiMsg }), {
        status: error.response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Internal server error", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error – see logs." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const response = await adminApiClient.post("/store-items", body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      const strapiError = error.response.data as StrapiError;
      const strapiMsg =
        strapiError?.error?.message ?? "Unknown Strapi error";
      console.error("Strapi error", error.response.status, strapiMsg);
      return new NextResponse(JSON.stringify({ message: strapiMsg }), {
        status: error.response.status,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Internal server error", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error – see logs." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
