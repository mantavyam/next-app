"use client"

import { useEffect } from "react"
import { defaultFonts } from "@/lib/constants"
import { preloadFonts, createFontFaceRules, cleanupFontResources } from "@/lib/utils/font-preloader"

export function FontProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Preload default fonts
    preloadFonts(defaultFonts)
    createFontFaceRules(defaultFonts)

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    }

    // Cleanup on unmount
    return () => {
      cleanupFontResources()
    }
  }, [])

  return children
}
