// Script to initialize logging with auth token
// This would typically be run once to set up the logging middleware

import { logger } from "../logging-middleware/index.js"

// You would replace this with your actual auth token obtained from the evaluation server
const AUTH_TOKEN = "your-auth-token-here"

// Initialize the logger with the auth token
logger.setAuthToken(AUTH_TOKEN)

console.log("Logging middleware initialized with auth token")
