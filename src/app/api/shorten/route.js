import { NextResponse } from "next/server";
import { saveLink } from "@/lib/db";
import { generateShortId } from "@/lib/utils";

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    let { originalUrl } = body;

    if (!originalUrl || typeof originalUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid payload: URL is required." },
        { status: 400 },
      );
    }

    originalUrl = originalUrl.trim();
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = "https://" + originalUrl;
    }

    try {
      const parsedUrl = new URL(originalUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Invalid protocol." },
          { status: 400 },
        );
      }
    } catch (_) {
      return NextResponse.json(
        { error: "Invalid URL format." },
        { status: 400 },
      );
    }

    // Generate ID & Save using the Pure Node Engine
    const shortId = generateShortId(6);
    saveLink(shortId, originalUrl);

    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/${shortId}`;

    return NextResponse.json(
      { success: true, shortId, originalUrl, shortUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("Critical API Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
