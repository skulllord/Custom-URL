import { Log } from "../../logging-middleware"

export class ShortcodeGenerator {
  private static readonly CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  private static readonly DEFAULT_LENGTH = 6

  public static async generateShortcode(length: number = this.DEFAULT_LENGTH): Promise<string> {
    await Log("backend", "debug", "utils", `Generating shortcode of length ${length}`)

    let result = ""
    for (let i = 0; i < length; i++) {
      result += this.CHARACTERS.charAt(Math.floor(Math.random() * this.CHARACTERS.length))
    }

    await Log("backend", "debug", "utils", `Generated shortcode: ${result}`)
    return result
  }

  public static async validateCustomShortcode(shortcode: string): Promise<boolean> {
    await Log("backend", "debug", "utils", `Validating custom shortcode: ${shortcode}`)

    // Check if shortcode is alphanumeric and reasonable length (3-20 characters)
    const isValid = /^[a-zA-Z0-9]{3,20}$/.test(shortcode)

    await Log("backend", "debug", "utils", `Shortcode validation result: ${isValid}`)
    return isValid
  }
}
