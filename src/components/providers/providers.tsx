"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { FontProvider } from "@/components/providers/font-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FontProvider>
        {children}
      </FontProvider>
    </ThemeProvider>
  )
}
