import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { HandwritingSettings } from "@/types"
import { defaultSettings } from "@/lib/defaults"

interface SettingsState {
  settings: HandwritingSettings
  updateSettings: (settings: Partial<HandwritingSettings>) => void
  resetSettings: () => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "handwriting-settings",
    }
  )
)
