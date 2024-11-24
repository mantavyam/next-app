"use client"

import { useState, useEffect } from "react"
import type { Font } from "@/types"

interface UseFontLoaderResult {
  isLoading: boolean
  error: Error | null
  loadFont: (font: Font) => Promise<void>
  loadedFonts: Font[]
}

export function useFontLoader(): UseFontLoaderResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [loadedFonts, setLoadedFonts] = useState<Font[]>([])

  // Clean up font resources when component unmounts
  useEffect(() => {
    const styleElements: HTMLStyleElement[] = []

    return () => {
      // Remove any style elements created for fonts
      styleElements.forEach((element) => {
        element.remove()
      })
      // Revoke object URLs
      loadedFonts.forEach((font) => {
        if (font.url.startsWith('blob:')) {
          URL.revokeObjectURL(font.url)
        }
      })
    }
  }, [loadedFonts])

  const loadFont = async (font: Font): Promise<void> => {
    try {
      // Check if font is already loaded
      if (loadedFonts.some((f) => f.name === font.name)) {
        return
      }

      setIsLoading(true)
      setError(null)

      // For Google Fonts, we need to load the CSS first
      if (font.url.includes('fonts.googleapis.com')) {
        const link = document.createElement('link')
        link.href = font.url
        link.rel = 'stylesheet'
        document.head.appendChild(link)
        
        // Wait for the font to load
        await document.fonts.ready

        // Add to loaded fonts
        setLoadedFonts((prev) => [...prev, font])
        return
      }

      // For custom fonts, use FontFace API
      const fontFace = new FontFace(font.name, `url(${font.url})`)
      const loadedFont = await fontFace.load()
      
      // Add the font to the document
      document.fonts.add(loadedFont)

      // Create a style element for the font
      const style = document.createElement('style')
      style.textContent = `
        @font-face {
          font-family: "${font.name}";
          src: url("${font.url}");
          font-style: normal;
          font-weight: 400;
        }
      `
      document.head.appendChild(style)

      // Add to loaded fonts
      setLoadedFonts((prev) => [...prev, font])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load font'))
      console.error('Failed to load font:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    loadFont,
    loadedFonts,
  }
}
