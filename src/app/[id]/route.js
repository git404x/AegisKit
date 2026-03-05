import { NextResponse } from "next/server";
import { getLink } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    // Look up the short ID in our local JSON engine
    const link = getLink(id);

    if (!link) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Execute the 307 Redirect to the original destination
    return NextResponse.redirect(link.original_url, 307);
  } catch (error) {
    console.error("Database retrieval failed:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
