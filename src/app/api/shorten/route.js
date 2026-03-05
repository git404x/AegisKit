import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateShortId } from "@/lib/utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const { originalUrl } = body;

    // Strict Validation
    if (!originalUrl || typeof originalUrl !== "string") {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    try {
      new URL(originalUrl); // Will throw an error if the URL is malformed
    } catch (_) {
      return NextResponse.json(
        { error: "Invalid URL format. Must include http:// or https://" },
        { status: 400 },
      );
    }

    // Generate secure 6-character ID
    const shortId = generateShortId(6);

    // Database Insertion (Prepared statement for security)
    const stmt = db.prepare(
      "INSERT INTO links (short_id, original_url) VALUES (?, ?)",
    );
    stmt.run(shortId, originalUrl);

    // 4. Construct the dynamic local/network URL to return to the client
    const host = request.headers.get("host");
    const protocol = host.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/${shortId}`;

    return NextResponse.json(
      { success: true, shortId, originalUrl, shortUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database operation failed:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
