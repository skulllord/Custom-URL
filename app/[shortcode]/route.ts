import { type NextRequest, NextResponse } from "next/server"
import { Log } from "../../logging-middleware"
import { UrlService } from "../../backend/services/url-service"

export async function GET(request: NextRequest, { params }: { params: { shortcode: string } }) {
  const { shortcode } = params

  await Log("backend", "info", "handler", `GET /${shortcode} - Redirect request received`)

  try {
    const referrer = request.headers.get("referer") || ""
    const userAgent = request.headers.get("user-agent") || ""

    const originalUrl = await UrlService.redirectToOriginalUrl(shortcode, referrer, userAgent)

    if (!originalUrl) {
      await Log("backend", "warn", "handler", `Redirect failed for shortcode: ${shortcode}`)
      return NextResponse.json({ error: "Short URL not found or expired" }, { status: 404 })
    }

    await Log("backend", "info", "handler", `Redirecting ${shortcode} to ${originalUrl}`)
    return NextResponse.redirect(originalUrl)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await Log("backend", "error", "handler", `Error during redirect: ${errorMessage}`)

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
