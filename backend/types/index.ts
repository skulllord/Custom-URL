export interface CreateShortUrlRequest {
  url: string
  validity?: number
  shortcode?: string
}

export interface CreateShortUrlResponse {
  shortLink: string
  expiry: string
}

export interface ShortUrlStats {
  shortcode: string
  originalUrl: string
  createdAt: string
  expiryAt: string
  totalClicks: number
  clicks: ClickData[]
}

export interface ClickData {
  timestamp: string
  referrer: string
  location: string
}

export interface ShortUrl {
  id: string
  shortcode: string
  originalUrl: string
  createdAt: Date
  expiryAt: Date
  clicks: ClickData[]
}
