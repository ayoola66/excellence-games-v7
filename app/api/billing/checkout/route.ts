import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import adminApiClient from "@/lib/admin-api-client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, mode } = await request.json();

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: "Price ID and mode are required" },
        { status: 400 }
      );
    }

    if (!["payment", "subscription"].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be "payment" or "subscription"' },
        { status: 400 }
      );
    }

    const { url } = await adminApiClient.createCheckoutSession({
      priceId,
      mode,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
