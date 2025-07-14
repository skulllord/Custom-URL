import { type NextRequest, NextResponse } from "next/server"
import { Log } from "../../../logging-middleware"
import { UrlService } from "../../../backend/services/url-service"
import type { CreateShortUrlRequest } from "../../../backend/types"

export async function POST(request: NextRequest) {
  await Log("backend", "info", "handler", "POST /shorturls - Create short URL request received")

  try {
    const body: CreateShortUrlRequest = await request.json()

    await Log("backend", "debug", "handler", `Request body: ${JSON.stringify(body)}`)

    // Validate required fields
    if (!body.url) {
      await Log("backend", "error", "handler", "Missing required field: url")
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const hostname = request.headers.get("host") || "localhost:3000"
    const result = await UrlService.createShortUrl(body, hostname)

    await Log("backend", "info", "handler", `Short URL created successfully: ${result.shortLink}`)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await Log("backend", "error", "handler", `Error creating short URL: ${errorMessage}`)

    if (errorMessage.includes("Invalid URL format")) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }
    if (errorMessage.includes("Invalid shortcode format")) {
      return NextResponse.json({ error: "Invalid shortcode format" }, { status: 400 })
    }
    if (errorMessage.includes("Shortcode already exists")) {
      return NextResponse.json({ error: "Shortcode already exists" }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
