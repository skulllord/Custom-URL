import { logger } from "../logging-middleware"

interface AuthCredentials {
  email: string
  name: string
  rollNo: string
  accessCode: string
  clientID: string
  clientSecret: string
}

interface AuthResponse {
  token_type: string
  access_token: string
  expires_in: number
}

export class AuthService {
  private static instance: AuthService
  private baseUrl = "http://20.244.56.144/evaluation-service"

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  public async authenticate(credentials: AuthCredentials): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const authData: AuthResponse = await response.json()
        const token = authData.access_token

        // Set the token in the logger
        logger.setAuthToken(token)

        return token
      } else {
        console.error("Authentication failed:", response.status, response.statusText)
        return null
      }
    } catch (error) {
      console.error("Error during authentication:", error)
      return null
    }
  }

  public initializeWithDemoCredentials() {
    // For evaluation purposes - replace with your actual credentials
    const demoCredentials: AuthCredentials = {
      email: "priyanshu@lpu.edu", // Replace with your actual email
      name: "Priyanshu baghel",
      rollNo: "12206834",
      accessCode: "your-access-code", // Replace with actual access code
      clientID: "your-client-id", // Replace with actual client ID
      clientSecret: "your-client-secret", // Replace with actual client secret
    }

    // For demo, we'll just set a placeholder token
    // In production, you would call this.authenticate(demoCredentials)
    const demoToken = "demo-token-replace-with-actual"
    logger.setAuthToken(demoToken)
  }
}
