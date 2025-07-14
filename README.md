# URL Shortener - Campus Evaluation Project

This project implements a comprehensive URL shortener with analytics, built for the campus hiring evaluation.

## Project Structure

\`\`\`
├── logging-middleware/     # Reusable logging middleware package
├── backend/               # Backend services and utilities
│   ├── services/         # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── stats/           # Statistics page
│   └── layout.tsx       # Root layout
└── scripts/             # Initialization scripts
\`\`\`

## Features

### Logging Middleware
- Reusable logging package that integrates with the evaluation server
- Supports different log levels (debug, info, warn, error, fatal)
- Stack-aware logging (backend/frontend)
- Package-specific logging categories

### Backend Microservice
- **POST /api/shorturls** - Create shortened URLs
- **GET /api/shorturls/[shortcode]** - Get URL statistics
- **GET /[shortcode]** - Redirect to original URL
- Custom shortcode support
- Configurable validity periods
- Click tracking and analytics

### Frontend Application
- **URL Shortener Page** - Shorten up to 5 URLs concurrently
- **Statistics Page** - View detailed analytics
- Material UI components
- Responsive design
- Client-side validation

## Technical Implementation

### URL Shortening Algorithm
- Generates unique 6-character alphanumeric shortcodes
- Supports custom shortcodes with validation
- Collision detection and handling
- Default 30-minute validity period

### Analytics Features
- Click tracking with timestamps
- Referrer information capture
- Coarse-grained location detection
- Comprehensive statistics display

### Error Handling
- Robust error handling throughout the application
- Appropriate HTTP status codes
- Descriptive error messages
- Extensive logging for debugging

## Installation & Setup

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up the logging middleware with your auth token
4. Run the development server: \`npm run dev\`
5. Access the application at http://localhost:3000

## API Documentation

### Create Short URL
\`\`\`
POST /api/shorturls
Content-Type: application/json

{
  "url": "https://example.com/very-long-url",
  "validity": 30,
  "shortcode": "custom123"
}
\`\`\`

### Get Statistics
\`\`\`
GET /api/shorturls/{shortcode}
\`\`\`

### Redirect
\`\`\`
GET /{shortcode}
\`\`\`

## Compliance

This implementation adheres to all evaluation requirements:
- ✅ Extensive logging middleware integration
- ✅ No console.log usage
- ✅ Material UI styling
- ✅ TypeScript implementation
- ✅ Production-grade code standards
- ✅ Comprehensive error handling
- ✅ Responsive design
- ✅ Up to 5 concurrent URL shortening
- ✅ Custom shortcode support
- ✅ Analytics and click tracking
