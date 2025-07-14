import { type NextRequest, NextResponse } from "next/server"
import { Log } from "../../../../logging-middleware"
import { UrlService } from "../../../../backend/services/url-service"

export async function GET(request: NextRequest, { params }: { params: { shortcode: string } }) {
  const { shortcode } = params

  await Log("backend", "info", "handler", `GET /shorturls/${shortcode} - Stats request received`)

  try {
    const stats = await UrlService.getShortUrlStats(shortcode)

    if (!stats) {
      await Log("backend", "warn", "handler", `Stats not found for shortcode: ${shortcode}`)
      return NextResponse.json({ error: "Short URL not found" }, { status: 404 })
    }

    await Log("backend", "info", "handler", `Stats retrieved successfully for: ${shortcode}`)
    return NextResponse.json(stats)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await Log("backend", "error", "handler", `Error retrieving stats: ${errorMessage}`)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
