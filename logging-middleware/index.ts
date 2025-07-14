// Reusable Logging Middleware Package
interface LogParams {
  stack: "backend" | "frontend"
  level: "debug" | "info" | "warn" | "error" | "fatal"
  package: string
  message: string
}

interface LogResponse {
  logID: string
  message: string
}

// Update the Logger class to handle missing auth token gracefully and add initialization method

class Logger {
  private static instance: Logger
  private authToken: string | null = null
  private baseUrl = "http://20.244.56.144/evaluation-service"
  private isInitialized = false

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public setAuthToken(token: string) {
    this.authToken = token
    this.isInitialized = true
  }

  public async initialize() {
    // For demo purposes, we'll use a placeholder token
    // In production, this would fetch from your registration/auth API
    if (!this.isInitialized) {
      // You should replace this with your actual auth token from the evaluation server
      const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token-for-evaluation"
      this.setAuthToken(demoToken)
    }
  }

  public async log(
    stack: LogParams["stack"],
    level: LogParams["level"],
    packageName: LogParams["package"],
    message: string,
  ): Promise<LogResponse | null> {
    try {
      // Auto-initialize if not done yet
      if (!this.isInitialized) {
        await this.initialize()
      }

      if (!this.authToken) {
        // Fallback to console for development - remove in production
        console.warn(`[${stack}:${level}:${packageName}] ${message}`)
        return null
      }

      const response = await fetch(`${this.baseUrl}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          stack,
          level,
          package: packageName,
          message,
        }),
      })

      if (response.ok) {
        return await response.json()
      } else {
        // Fallback to console for development
        console.warn(`[${stack}:${level}:${packageName}] ${message}`)
        return null
      }
    } catch (error) {
      // Fallback to console for development
      console.warn(`[${stack}:${level}:${packageName}] ${message}`)
      return null
    }
  }
}

// Export the singleton instance and a convenience function
export const logger = Logger.getInstance()

export const Log = async (
  stack: LogParams["stack"],
  level: LogParams["level"],
  packageName: LogParams["package"],
  message: string,
) => {
  return await logger.log(stack, level, packageName, message)
}

// Validate package names based on stack
export const validatePackage = (stack: string, packageName: string): boolean => {
  const backendPackages = [
    "cache",
    "controller",
    "cron_job",
    "db",
    "domain",
    "handler",
    "repository",
    "route",
    "service",
  ]
  const frontendPackages = ["api", "component", "hook", "page", "state", "style"]
  const commonPackages = ["auth", "config", "middleware", "utils"]

  if (stack === "backend") {
    return [...backendPackages, ...commonPackages].includes(packageName)
  } else if (stack === "frontend") {
    return [...frontendPackages, ...commonPackages].includes(packageName)
  }
  return false
}
