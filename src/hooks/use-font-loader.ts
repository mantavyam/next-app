"use client"

import { useState, useEffect } from "react"
import type { Font } from "@/types"

interface UseFontLoaderResult {
  isLoading: boolean
  error: Error | null
  loadFont: (font: Font) => Promise<void>
}

export function useFontLoader(): UseFontLoaderResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Clean up font resources when component unmounts
  useEffect(() => {
    const styleElements: HTMLStyleElement[] = []

    return () => {
      // Remove any style elements created for fonts
      styleElements.forEach((element) => {
        element.remove()
      })
    }
  }, [])

  const loadFont = async (font: Font): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // Create a style element for the font
      const style = document.createElement("style")
      style.textContent = `
        @font-face {
          font-family: "${font.name}";
          src: url("${font.url}") format("${
        font.url.endsWith(".ttf") ? "truetype" : "opentype"
      }");
          font-display: swap;
        }
      `
      document.head.appendChild(style)

      // Create a test element to ensure the font loads
      const testElement = document.createElement("span")
      testElement.style.fontFamily = font.name
      testElement.style.visibility = "hidden"
      testElement.textContent = "Test"
      document.body.appendChild(testElement)

      // Wait for the font to load with a timeout
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Font loading timeout")), 5000)
      })

      await Promise.race([
        document.fonts.ready,
        timeout
      ])

      // Clean up test element
      document.body.removeChild(testElement)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load font"))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    loadFont,
  }
}
