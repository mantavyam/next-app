"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { defaultFonts } from "@/lib/constants"
import { Label } from "@/components/ui/label"
import type { Font } from "@/types"

interface FontSelectProps {
  value: Font
  onValueChange: (font: Font) => void
  customFonts?: Font[]
}

export function FontSelect({ value, onValueChange, customFonts = [] }: FontSelectProps) {
  const handleFontChange = (fontName: string) => {
    const font = [...defaultFonts, ...customFonts].find((f) => f.name === fontName)
    if (font) {
      onValueChange(font)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="font-select">Handwriting Font</Label>
      <Select
        value={value.name}
        onValueChange={handleFontChange}
        name="font-select"
        aria-label="Select handwriting font"
      >
        <SelectTrigger
          id="font-select"
          aria-label={`Current font: ${value.name}`}
        >
          <SelectValue
            placeholder="Select a font"
            aria-label="Selected font"
          />
        </SelectTrigger>
        <SelectContent>
          {defaultFonts.length > 0 && (
            <SelectGroup>
              <SelectLabel>Default Fonts</SelectLabel>
              {defaultFonts.map((font) => (
                <SelectItem
                  key={font.name}
                  value={font.name}
                  style={{ fontFamily: font.name }}
                  aria-label={`Default font: ${font.name}`}
                >
                  {font.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {customFonts.length > 0 && (
            <SelectGroup>
              <SelectLabel>Custom Fonts</SelectLabel>
              {customFonts.map((font) => (
                <SelectItem
                  key={font.name}
                  value={font.name}
                  style={{ fontFamily: font.name }}
                  aria-label={`Custom font: ${font.name}`}
                >
                  {font.name}
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground" id="font-select-help">
        Select a handwriting font or upload your own
      </p>
    </div>
  )
}
