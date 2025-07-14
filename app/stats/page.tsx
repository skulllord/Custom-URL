"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  TextField,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material"
import { ExpandMore, Search } from "@mui/icons-material"
import { Log } from "../../logging-middleware"

interface ClickData {
  timestamp: string
  referrer: string
  location: string
}

interface ShortUrlStats {
  shortcode: string
  originalUrl: string
  createdAt: string
  expiryAt: string
  totalClicks: number
  clicks: ClickData[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<ShortUrlStats | null>(null)
  const [shortcode, setShortcode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const initializeLogging = async () => {
      try {
        // await logger.initialize() // Assuming logger is defined elsewhere, uncomment if needed
        await Log("frontend", "info", "page", "URL Statistics page initialized")
      } catch (error) {
        console.warn("Failed to initialize logging:", error)
      }
    }
    initializeLogging()
  }, [])

  const fetchStats = async () => {
    if (!shortcode.trim()) {
      setError("Please enter a shortcode")
      return
    }

    await Log("frontend", "info", "api", `Fetching stats for shortcode: ${shortcode}`)

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/shorturls/${shortcode}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Short URL not found")
        }
        throw new Error("Failed to fetch statistics")
      }

      const data: ShortUrlStats = await response.json()
      setStats(data)

      await Log("frontend", "info", "api", `Successfully fetched stats for ${shortcode}: ${data.totalClicks} clicks`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setError(errorMessage)
      await Log("frontend", "error", "api", `Error fetching stats: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      fetchStats()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (expiryDate: string) => {
    return new Date() > new Date(expiryDate)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        URL Statistics
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        View detailed analytics for your shortened URLs
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Search Statistics
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Enter Shortcode"
                placeholder="e.g., abcd1"
                value={shortcode}
                onChange={(e) => setShortcode(e.target.value)}
                onKeyPress={handleKeyPress}
                helperText="Enter the shortcode (the part after the domain in your short URL)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<Search />}
                onClick={fetchStats}
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Statistics"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {stats && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Statistics for: {stats.shortcode}
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Original URL
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                    {stats.originalUrl}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Clicks
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {stats.totalClicks}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={3}>
                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={isExpired(stats.expiryAt) ? "Expired" : "Active"}
                    color={isExpired(stats.expiryAt) ? "error" : "success"}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">{formatDate(stats.createdAt)}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expires At
                </Typography>
                <Typography variant="body1">{formatDate(stats.expiryAt)}</Typography>
              </Grid>
            </Grid>

            {stats.clicks.length > 0 ? (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">Click Details ({stats.clicks.length} clicks)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.clicks.map((click, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(click.timestamp)}</TableCell>
                            <TableCell>{click.referrer}</TableCell>
                            <TableCell>
                              <Chip label={click.location} size="small" variant="outlined" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ) : (
              <Alert severity="info">No clicks recorded yet for this short URL.</Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
