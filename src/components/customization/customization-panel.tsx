"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FontSelect } from "./font-select"
import { FontUpload } from "./font-upload"
import { handwritingSettingsSchema } from "@/lib/validations/handwriting-schema"
import type { HandwritingSettings, Font } from "@/types"
import type { HandwritingSettingsSchema } from "@/lib/validations/handwriting-schema"
import { toast } from "sonner"
import { useState, useEffect, useCallback } from "react"
import { ColorPicker } from "./color-picker"

interface CustomizationPanelProps {
  settings: HandwritingSettings
  onSettingsChange: (settings: HandwritingSettings) => void
}

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72]

const defaultFont = {
  name: "Homemade Apple",
  url: "https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap",
  style: "font-family: 'Homemade Apple', cursive;"
}

const defaultSettings: HandwritingSettings = {
  fontSize: 16,
  lineHeight: 32,
  letterSpacing: 1,
  wordSpacing: 3,
  topPadding: 20,
  paperMargins: true,
  paperLines: true,
  inkColor: '#000000',
  currentFont: defaultFont,
  lineColor: "#e5e7eb",
  lineOpacity: 100,
  lineWidth: 1,
  lineSpacing: 24,
  marginColor: "#ef4444"
}

export function CustomizationPanel({
  settings: externalSettings,
  onSettingsChange,
}: CustomizationPanelProps) {
  const [settings, setSettings] = useState<HandwritingSettings>(() => ({
    ...defaultSettings,
    ...externalSettings
  }))

  const form = useForm<HandwritingSettingsSchema>({
    resolver: zodResolver(handwritingSettingsSchema),
    defaultValues: settings,
    mode: "onChange"
  })

  // Update form when external settings change
  useEffect(() => {
    const newSettings = { ...defaultSettings, ...externalSettings }
    setSettings(newSettings)
    Object.entries(newSettings).forEach(([key, value]) => {
      form.setValue(key as keyof HandwritingSettings, value, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true
      })
    })
  }, [externalSettings, form])

  const updateSetting = useCallback(<K extends keyof HandwritingSettings>(
    key: K,
    value: HandwritingSettings[K]
  ) => {
    try {
      const newSettings = {
        ...settings,
        [key]: value,
      }

      // Validate the new value
      const result = handwritingSettingsSchema.safeParse(newSettings)
      if (!result.success) {
        toast.error("Invalid setting value", {
          description: result.error.errors[0]?.message || "Please check your input"
        })
        return
      }

      setSettings(newSettings)
      form.setValue(key, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      })
      onSettingsChange(newSettings)
    } catch (error) {
      toast.error("Failed to update setting", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }, [settings, form, onSettingsChange])

  const [customFonts, setCustomFonts] = useState<Font[]>([])

  const handleFontUpload = useCallback((font: Font) => {
    setCustomFonts((prev) => [...prev, font])
    updateSetting("currentFont", font)
  }, [updateSetting])

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="paper">Paper</TabsTrigger>
            <TabsTrigger value="font">Font</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select
                value={settings.fontSize.toString()}
                onValueChange={(value) => updateSetting("fontSize", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Line Height ({settings.lineHeight}px)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">16px</span>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting("lineHeight", value)}
                  min={16}
                  max={100}
                  step={2}
                  className="flex-1"
                />
                <span className="text-sm">100px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Letter Spacing ({settings.letterSpacing}px)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">-5px</span>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting("letterSpacing", value)}
                  min={-5}
                  max={20}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm">20px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Word Spacing ({settings.wordSpacing}px)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">0px</span>
                <Slider
                  value={[settings.wordSpacing]}
                  onValueChange={([value]) => updateSetting("wordSpacing", value)}
                  min={0}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm">50px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ink Color</Label>
              <ColorPicker
                color={settings.inkColor}
                onChange={(color) => updateSetting("inkColor", color)}
              />
            </div>
          </TabsContent>

          <TabsContent value="paper" className="space-y-6">
            <div className="space-y-2">
              <Label>Top Padding ({settings.topPadding}px)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm">0px</span>
                <Slider
                  value={[settings.topPadding]}
                  onValueChange={([value]) => updateSetting("topPadding", value)}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm">100px</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="paper-lines">Paper Lines</Label>
                <Switch
                  id="paper-lines"
                  checked={settings.paperLines}
                  onCheckedChange={(checked) => updateSetting("paperLines", checked)}
                />
              </div>

              {settings.paperLines && (
                <>
                  <div className="space-y-2">
                    <Label>Line Color</Label>
                    <ColorPicker
                      color={settings.lineColor || "#e5e7eb"}
                      onChange={(color) => updateSetting("lineColor", color)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line Opacity ({settings.lineOpacity || 100}%)</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">0%</span>
                      <Slider
                        value={[settings.lineOpacity || 100]}
                        onValueChange={([value]) => updateSetting("lineOpacity", value)}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-sm">100%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Line Width ({settings.lineWidth || 1}px)</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">0.5px</span>
                      <Slider
                        value={[settings.lineWidth || 1]}
                        onValueChange={([value]) => updateSetting("lineWidth", value)}
                        min={0.5}
                        max={3}
                        step={0.5}
                        className="flex-1"
                      />
                      <span className="text-sm">3px</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Line Spacing ({settings.lineSpacing || 24}px)</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">16px</span>
                      <Slider
                        value={[settings.lineSpacing || 24]}
                        onValueChange={([value]) => updateSetting("lineSpacing", value)}
                        min={16}
                        max={48}
                        step={2}
                        className="flex-1"
                      />
                      <span className="text-sm">48px</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="paper-margins">Paper Margins</Label>
                <Switch
                  id="paper-margins"
                  checked={settings.paperMargins}
                  onCheckedChange={(checked) => updateSetting("paperMargins", checked)}
                />
              </div>

              {settings.paperMargins && (
                <div className="space-y-2">
                  <Label>Margin Color</Label>
                  <ColorPicker
                    color={settings.marginColor || "#ef4444"}
                    onChange={(color) => updateSetting("marginColor", color)}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="font" className="space-y-6">
            <div className="space-y-4">
              <FontSelect
                value={settings.currentFont}
                onValueChange={(font) => updateSetting("currentFont", font)}
                customFonts={customFonts}
              />
              <FontUpload onFontUpload={handleFontUpload} />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
