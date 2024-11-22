import type { Font } from "@/types"

export async function preloadFonts(fonts: Font[]): Promise<void> {
  const preloadPromises = fonts.map((font) => {
    return new Promise<void>((resolve, reject) => {
      // First load the Google Fonts CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = font.url
      link.crossOrigin = "anonymous"

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to load font: ${font.name}`))

      document.head.appendChild(link)
    })
  })

  try {
    await Promise.allSettled(preloadPromises)
  } catch (error) {
    console.warn("Some fonts failed to load:", error)
  }
}

export function createFontFaceRules(fonts: Font[]): void {
  // No need to create @font-face rules since we're using Google Fonts CSS
  return
}

export function cleanupFontResources(): void {
  // Remove all font stylesheet links
  const styleLinks = document.head.querySelectorAll('link[rel="stylesheet"]')
  styleLinks.forEach((link) => {
    if (link.href.includes("fonts.googleapis.com")) {
      link.remove()
    }
  })
}
