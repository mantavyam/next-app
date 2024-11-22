import { useTheme as useNextTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useTheme() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useNextTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return {
    theme: mounted ? theme : undefined,
    systemTheme: mounted ? systemTheme : undefined,
    setTheme,
    toggleTheme,
    mounted,
  }
}