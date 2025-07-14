"use client"

import { useState } from "react"
import { Container, Typography, TextField, Button, Card, CardContent, Box, Alert, Grid } from "@mui/material"
import { AuthService } from "../../lib/auth-service"

export default function SetupPage() {
  const [credentials, setCredentials] = useState({
    email: "priyanshu@lpu.edu",
    name: "Priyanshu baghel",
    rollNo: "12206834",
    accessCode: "",
    clientID: "",
    clientSecret: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
  }

  const handleAuthenticate = async () => {
    setLoading(true)
    setError("")

    try {
      const authService = AuthService.getInstance()
      const token = await authService.authenticate(credentials)

      if (token) {
        setSuccess(true)
      } else {
        setError("Authentication failed. Please check your credentials.")
      }
    } catch (error) {
      setError("An error occurred during authentication.")
    } finally {
      setLoading(false)
    }
  }

  const handleUseDemoMode = () => {
    const authService = AuthService.getInstance()
    authService.initializeWithDemoCredentials()
    setSuccess(true)
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Authentication successful! You can now use the URL shortener.
        </Alert>
        <Button variant="contained" href="/">
          Go to URL Shortener
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Setup Authentication
      </Typography>

      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Configure your evaluation server credentials to enable logging
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Evaluation Server Credentials
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={credentials.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={credentials.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Roll Number"
                value={credentials.rollNo}
                onChange={(e) => handleInputChange("rollNo", e.target.value)}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Access Code"
                value={credentials.accessCode}
                onChange={(e) => handleInputChange("accessCode", e.target.value)}
                placeholder="Enter your access code"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client ID"
                value={credentials.clientID}
                onChange={(e) => handleInputChange("clientID", e.target.value)}
                placeholder="Enter your client ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Client Secret"
                value={credentials.clientSecret}
                onChange={(e) => handleInputChange("clientSecret", e.target.value)}
                placeholder="Enter your client secret"
                type="password"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAuthenticate}
              disabled={loading || !credentials.accessCode || !credentials.clientID || !credentials.clientSecret}
              sx={{ flex: 1 }}
            >
              {loading ? "Authenticating..." : "Authenticate"}
            </Button>
            <Button variant="outlined" onClick={handleUseDemoMode} sx={{ flex: 1 }}>
              Use Demo Mode
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Demo Mode:</strong> Uses placeholder credentials for testing. For actual evaluation, use your real
              credentials from the registration process.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  )
}
