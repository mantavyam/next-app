"use client"

import { useState } from 'react'
import { DrawingPanel } from './editor/drawing-panel'
import { CustomizationPanel } from './customization/customization-panel'
import { InteractivePaper } from './editor/interactive-paper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Type, PenTool } from "lucide-react"
import type { HandwritingSettings } from '@/types'

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
  currentFont: defaultFont
}

export function TextToHandwriting() {
  const [text, setText] = useState('')
  const [settings, setSettings] = useState<HandwritingSettings>(defaultSettings)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Paper Panel - 9 columns */}
          <div className="col-span-9">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Write Text
                </TabsTrigger>
                <TabsTrigger value="draw" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
                  <InteractivePaper settings={settings} onChange={setText} />
                </div>
              </TabsContent>
              <TabsContent value="draw">
                <DrawingPanel className="w-full" settings={settings} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Customization Panel - 3 columns */}
          <div className="col-span-3">
            <CustomizationPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>
      </div>
    </div>
  )
}
