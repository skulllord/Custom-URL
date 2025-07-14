import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box } from "@mui/material"
import { createTheme } from "@mui/material/styles"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
})

export const metadata: Metadata = {
  title: "URL Shortener - Campus Evaluation",
  description: "A robust URL shortener with analytics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                URL Shortener
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button color="inherit" component={Link} href="/">
                  Shorten URLs
                </Button>
                <Button color="inherit" component={Link} href="/stats">
                  Statistics
                </Button>
                <Button color="inherit" component={Link} href="/setup">
                  Setup
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
