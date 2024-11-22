import { useState, useCallback } from "react"
import type { Font, FontSettings } from "@/types"

const DEFAULT_FONTS: Font[] = [
  {
    name: "Homemade Apple",
    url: "https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap",
    style: "font-family: 'Homemade Apple', cursive;",
  },
  {
    name: "Caveat",
    url: "https://fonts.googleapis.com/css2?family=Caveat&display=swap",
    style: "font-family: 'Caveat', cursive;",
  },
  {
    name: "Dancing Script",
    url: "https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap",
    style: "font-family: 'Dancing Script', cursive;",
  },
]

export function useFonts() {
  const [fontSettings, setFontSettings] = useState<FontSettings>({
    currentFont: DEFAULT_FONTS[0].name,
    customFonts: [],
  })

  const loadFont = useCallback(async (font: Font) => {
    try {
      const fontFace = new FontFace(font.name, `url(${font.url})`)
      const loadedFont = await fontFace.load()
      document.fonts.add(loadedFont)
      return true
    } catch (error) {
      console.error("Error loading font:", error)
      return false
    }
  }, [])

  const addCustomFont = useCallback(async (file: File) => {
    try {
      const url = URL.createObjectURL(file)
      const font: Font = {
        name: file.name.split(".")[0],
        url,
        style: `font-family: '${file.name.split(".")[0]}';`,
      }

      const success = await loadFont(font)
      if (success) {
        setFontSettings(prev => ({
          ...prev,
          customFonts: [...prev.customFonts, font],
          currentFont: font.name,
        }))
      }
    } catch (error) {
      console.error("Error adding custom font:", error)
    }
  }, [loadFont])

  const setCurrentFont = useCallback((fontName: string) => {
    setFontSettings(prev => ({
      ...prev,
      currentFont: fontName,
    }))
  }, [])

  return {
    fontSettings,
    defaultFonts: DEFAULT_FONTS,
    addCustomFont,
    setCurrentFont,
  }
}