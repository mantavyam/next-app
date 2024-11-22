"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { FontSelect } from "./font-select"
import { FontUpload } from "./font-upload"
import { handwritingSettingsSchema } from "@/lib/validations/handwriting-schema"
import type { HandwritingSettings } from "@/types"
import type { HandwritingSettingsSchema } from "@/lib/validations/handwriting-schema"
import { toast } from "sonner"
import { useState } from "react"

interface CustomizationPanelProps {
  settings: HandwritingSettings
  onSettingsChange: (settings: HandwritingSettings) => void
}

export function CustomizationPanel({
  settings,
  onSettingsChange,
}: CustomizationPanelProps) {
  const form = useForm<HandwritingSettingsSchema>({
    resolver: zodResolver(handwritingSettingsSchema),
    defaultValues: settings,
  })

  const onSubmit = (data: HandwritingSettingsSchema) => {
    onSettingsChange(data)
    toast.success("Settings updated successfully")
  }

  const onError = () => {
    toast.error("Invalid settings", {
      description: "Please check the validation errors below.",
    })
  }

  const updateSetting = <K extends keyof HandwritingSettings>(
    key: K,
    value: HandwritingSettings[K]
  ) => {
    try {
      form.setValue(key, value)
      onSettingsChange({
        ...settings,
        [key]: value,
      })
    } catch (error) {
      toast.error("Failed to update setting", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  const [customFonts, setCustomFonts] = useState<Font[]>([])

  const handleFontUpload = (font: Font) => {
    setCustomFonts((prev) => [...prev, font])
    updateSetting("currentFont", font)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onChange={form.handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Font Size */}
          <div className="space-y-2">
            <Label>Font Size ({settings.fontSize}px)</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting("fontSize", value)}
              min={8}
              max={72}
              step={1}
            />
            {form.formState.errors.fontSize && (
              <p className="text-sm text-destructive">
                {form.formState.errors.fontSize.message}
              </p>
            )}
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>Line Height ({settings.lineHeight}px)</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => updateSetting("lineHeight", value)}
              min={1}
              max={100}
              step={1}
            />
            {form.formState.errors.lineHeight && (
              <p className="text-sm text-destructive">
                {form.formState.errors.lineHeight.message}
              </p>
            )}
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label>Letter Spacing ({settings.letterSpacing}px)</Label>
            <Slider
              value={[settings.letterSpacing]}
              onValueChange={([value]) => updateSetting("letterSpacing", value)}
              min={-5}
              max={20}
              step={0.5}
            />
            {form.formState.errors.letterSpacing && (
              <p className="text-sm text-destructive">
                {form.formState.errors.letterSpacing.message}
              </p>
            )}
          </div>

          {/* Word Spacing */}
          <div className="space-y-2">
            <Label>Word Spacing ({settings.wordSpacing}px)</Label>
            <Slider
              value={[settings.wordSpacing]}
              onValueChange={([value]) => updateSetting("wordSpacing", value)}
              min={0}
              max={50}
              step={1}
            />
            {form.formState.errors.wordSpacing && (
              <p className="text-sm text-destructive">
                {form.formState.errors.wordSpacing.message}
              </p>
            )}
          </div>

          {/* Top Padding */}
          <div className="space-y-2">
            <Label>Top Padding ({settings.topPadding}px)</Label>
            <Slider
              value={[settings.topPadding]}
              onValueChange={([value]) => updateSetting("topPadding", value)}
              min={0}
              max={100}
              step={5}
            />
            {form.formState.errors.topPadding && (
              <p className="text-sm text-destructive">
                {form.formState.errors.topPadding.message}
              </p>
            )}
          </div>

          {/* Paper Lines */}
          <div className="flex items-center space-x-2">
            <Switch
              id="paper-lines"
              checked={settings.paperLines}
              onCheckedChange={(checked) => updateSetting("paperLines", checked)}
            />
            <Label htmlFor="paper-lines">Show Paper Lines</Label>
          </div>

          {/* Paper Margins */}
          <div className="flex items-center space-x-2">
            <Switch
              id="paper-margins"
              checked={settings.paperMargins}
              onCheckedChange={(checked) => updateSetting("paperMargins", checked)}
            />
            <Label htmlFor="paper-margins">Show Paper Margins</Label>
          </div>

          {/* Font Selection */}
          <div className="space-y-4">
            <FontSelect
              value={settings.currentFont}
              onValueChange={(font) => updateSetting("currentFont", font)}
              customFonts={customFonts}
            />
            <FontUpload onFontUpload={handleFontUpload} />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
