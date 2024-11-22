import { defaultFonts } from "./constants"
import type { HandwritingSettings } from "@/types"

export const defaultSettings: HandwritingSettings = {
  fontSize: 24,
  lineHeight: 36,
  letterSpacing: 1,
  wordSpacing: 6,
  topPadding: 40,
  paperMargins: true,
  paperLines: true,
  inkColor: "#000000",
  currentFont: defaultFonts[0], // Homemade Apple font
}
