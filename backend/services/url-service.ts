import { Log } from "../../logging-middleware"
import type { ShortUrl, CreateShortUrlRequest, CreateShortUrlResponse, ShortUrlStats, ClickData } from "../types"
import { ShortcodeGenerator } from "../utils/shortcode-generator"

export class UrlService {
  private static urls: Map<string, ShortUrl> = new Map()

  public static async createShortUrl(
    request: CreateShortUrlRequest,
    hostname: string,
  ): Promise<CreateShortUrlResponse> {
    await Log("backend", "info", "service", `Creating short URL for: ${request.url}`)

    try {
      // Validate URL format
      new URL(request.url)
    } catch (error) {
      await Log("backend", "error", "service", `Invalid URL format: ${request.url}`)
      throw new Error("Invalid URL format")
    }

    let shortcode = request.shortcode

    if (shortcode) {
      // Validate custom shortcode
      const isValid = await ShortcodeGenerator.validateCustomShortcode(shortcode)
      if (!isValid) {
        await Log("backend", "error", "service", `Invalid custom shortcode: ${shortcode}`)
        throw new Error("Invalid shortcode format")
      }

      // Check if shortcode already exists
      if (this.urls.has(shortcode)) {
        await Log("backend", "error", "service", `Shortcode collision: ${shortcode}`)
        throw new Error("Shortcode already exists")
      }
    } else {
      // Generate unique shortcode
      do {
        shortcode = await ShortcodeGenerator.generateShortcode()
      } while (this.urls.has(shortcode))
    }

    const validity = request.validity || 30 // Default 30 minutes
    const now = new Date()
    const expiryAt = new Date(now.getTime() + validity * 60 * 1000)

    const shortUrl: ShortUrl = {
      id: crypto.randomUUID(),
      shortcode,
      originalUrl: request.url,
      createdAt: now,
      expiryAt,
      clicks: [],
    }

    this.urls.set(shortcode, shortUrl)

    await Log("backend", "info", "service", `Short URL created successfully: ${shortcode}`)

    return {
      shortLink: `http://${hostname}/${shortcode}`,
      expiry: expiryAt.toISOString(),
    }
  }

  public static async getShortUrlStats(shortcode: string): Promise<ShortUrlStats | null> {
    await Log("backend", "info", "service", `Retrieving stats for shortcode: ${shortcode}`)

    const shortUrl = this.urls.get(shortcode)
    if (!shortUrl) {
      await Log("backend", "warn", "service", `Shortcode not found: ${shortcode}`)
      return null
    }

    const stats: ShortUrlStats = {
      shortcode: shortUrl.shortcode,
      originalUrl: shortUrl.originalUrl,
      createdAt: shortUrl.createdAt.toISOString(),
      expiryAt: shortUrl.expiryAt.toISOString(),
      totalClicks: shortUrl.clicks.length,
      clicks: shortUrl.clicks,
    }

    await Log("backend", "debug", "service", `Stats retrieved for ${shortcode}: ${stats.totalClicks} clicks`)
    return stats
  }

  public static async redirectToOriginalUrl(shortcode: string, referrer = "", userAgent = ""): Promise<string | null> {
    await Log("backend", "info", "service", `Redirect request for shortcode: ${shortcode}`)

    const shortUrl = this.urls.get(shortcode)
    if (!shortUrl) {
      await Log("backend", "warn", "service", `Shortcode not found for redirect: ${shortcode}`)
      return null
    }

    // Check if URL has expired
    if (new Date() > shortUrl.expiryAt) {
      await Log("backend", "warn", "service", `Expired shortcode accessed: ${shortcode}`)
      return null
    }

    // Record click data
    const clickData: ClickData = {
      timestamp: new Date().toISOString(),
      referrer: referrer || "Direct",
      location: this.getLocationFromUserAgent(userAgent),
    }

    shortUrl.clicks.push(clickData)

    await Log("backend", "info", "service", `Successful redirect for ${shortcode} to ${shortUrl.originalUrl}`)
    return shortUrl.originalUrl
  }

  private static getLocationFromUserAgent(userAgent: string): string {
    // Simple location detection based on user agent (coarse-grained)
    if (userAgent.includes("Mobile")) return "Mobile Device"
    if (userAgent.includes("Windows")) return "Windows"
    if (userAgent.includes("Mac")) return "macOS"
    if (userAgent.includes("Linux")) return "Linux"
    return "Unknown"
  }

  public static async getAllUrls(): Promise<ShortUrl[]> {
    await Log("backend", "debug", "service", "Retrieving all URLs")
    return Array.from(this.urls.values())
  }
}
