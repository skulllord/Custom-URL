"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material"
import { Add, Delete, ContentCopy } from "@mui/icons-material"
import { Log } from "../logging-middleware"

interface UrlEntry {
  id: string
  url: string
  validity: string
  shortcode: string
}

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortLink: string
  expiry: string
}

export default function UrlShortenerPage() {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([{ id: "1", url: "", validity: "30", shortcode: "" }])
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const initializeLogging = async () => {
      try {
        // await logger.initialize() // Assuming logger is defined elsewhere and initialized
        await Log("frontend", "info", "page", "URL Shortener page initialized")
      } catch (error) {
        console.warn("Failed to initialize logging:", error)
      }
    }
    initializeLogging()
  }, [])

  const addUrlEntry = async () => {
    if (urlEntries.length >= 5) {
      await Log("frontend", "warn", "page", "Maximum URL entries limit reached")
      setError("Maximum 5 URLs allowed")
      return
    }

    const newEntry: UrlEntry = {
      id: Date.now().toString(),
      url: "",
      validity: "30",
      shortcode: "",
    }

    setUrlEntries([...urlEntries, newEntry])
    await Log("frontend", "debug", "page", `Added new URL entry: ${newEntry.id}`)
  }

  const removeUrlEntry = async (id: string) => {
    setUrlEntries(urlEntries.filter((entry) => entry.id !== id))
    await Log("frontend", "debug", "page", `Removed URL entry: ${id}`)
  }

  const updateUrlEntry = (id: string, field: keyof UrlEntry, value: string) => {
    setUrlEntries(urlEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateInputs = async (): Promise<boolean> => {
    await Log("frontend", "debug", "component", "Validating user inputs")

    for (const entry of urlEntries) {
      if (!entry.url.trim()) {
        setError("All URL fields must be filled")
        await Log("frontend", "error", "component", "Empty URL field found")
        return false
      }

      if (!validateUrl(entry.url)) {
        setError("Invalid URL format detected")
        await Log("frontend", "error", "component", `Invalid URL format: ${entry.url}`)
        return false
      }

      const validity = Number.parseInt(entry.validity)
      if (isNaN(validity) || validity <= 0) {
        setError("Validity must be a positive number")
        await Log("frontend", "error", "component", `Invalid validity: ${entry.validity}`)
        return false
      }

      if (entry.shortcode && !/^[a-zA-Z0-9]{3,20}$/.test(entry.shortcode)) {
        setError("Shortcode must be 3-20 alphanumeric characters")
        await Log("frontend", "error", "component", `Invalid shortcode: ${entry.shortcode}`)
        return false
      }
    }

    return true
  }

  const handleShortenUrls = async () => {
    await Log("frontend", "info", "component", "Starting URL shortening process")

    setError("")
    setLoading(true)

    if (!(await validateInputs())) {
      setLoading(false)
      return
    }

    try {
      const promises = urlEntries.map(async (entry) => {
        const response = await fetch("/api/shorturls", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: entry.url,
            validity: Number.parseInt(entry.validity),
            shortcode: entry.shortcode || undefined,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to shorten URL")
        }

        const result = await response.json()
        return {
          id: entry.id,
          originalUrl: entry.url,
          shortLink: result.shortLink,
          expiry: result.expiry,
        }
      })

      const results = await Promise.all(promises)
      setShortenedUrls(results)

      await Log("frontend", "info", "component", `Successfully shortened ${results.length} URLs`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      await Log("frontend", "error", "component", `Error shortening URLs: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      await Log("frontend", "debug", "component", "URL copied to clipboard")
    } catch (error) {
      await Log("frontend", "error", "component", "Failed to copy URL to clipboard")
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        URL Shortener
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Shorten up to 5 URLs with custom shortcodes and validity periods
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5">Enter URLs to Shorten</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={addUrlEntry} disabled={urlEntries.length >= 5}>
              Add URL ({urlEntries.length}/5)
            </Button>
          </Box>

          {urlEntries.map((entry, index) => (
            <Box key={entry.id} sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">URL {index + 1}</Typography>
                {urlEntries.length > 1 && (
                  <IconButton onClick={() => removeUrlEntry(entry.id)} color="error">
                    <Delete />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com/very-long-url"
                    value={entry.url}
                    onChange={(e) => updateUrlEntry(entry.id, "url", e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    type="number"
                    value={entry.validity}
                    onChange={(e) => updateUrlEntry(entry.id, "validity", e.target.value)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="mycode123"
                    value={entry.shortcode}
                    onChange={(e) => updateUrlEntry(entry.id, "shortcode", e.target.value)}
                    helperText="3-20 alphanumeric characters"
                  />
                </Grid>
              </Grid>
            </Box>
          ))}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleShortenUrls}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Shortening URLs..." : "Shorten URLs"}
          </Button>
        </CardContent>
      </Card>

      {shortenedUrls.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Shortened URLs
            </Typography>

            {shortenedUrls.map((url) => (
              <Box key={url.id} sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original: {url.originalUrl}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="h6" color="primary">
                    {url.shortLink}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton size="small" onClick={() => copyToClipboard(url.shortLink)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Chip label={`Expires: ${new Date(url.expiry).toLocaleString()}`} size="small" color="secondary" />
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
