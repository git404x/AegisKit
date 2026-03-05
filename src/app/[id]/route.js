import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Look up the short ID in our local SQLite database
    const stmt = db.prepare(
      "SELECT original_url FROM links WHERE short_id = ?",
    );
    const link = stmt.get(id);

    if (!link) {
      // If the shortlink doesn't exist, route them back to the AegisKit dashboard safely
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Execute the 307 Redirect to the original destination
    return NextResponse.redirect(link.original_url, 307);
  } catch (error) {
    console.error("Database retrieval failed:", error);
    // On critical failure, fallback to home to prevent exposing server errors
    return NextResponse.redirect(new URL("/", request.url));
  }
}
