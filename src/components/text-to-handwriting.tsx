"use client"

import { useState } from 'react'
import { TextInput } from './editor/text-input'
import { CanvasOutput } from './editor/canvas-output'
import { DrawingPanel } from './editor/drawing-panel'
import { CustomizationPanel } from './customization/customization-panel'
import { Header } from './shared/header'
import { Footer } from './shared/footer'
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
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-8">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="draw" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="space-y-8">
                <div className="rounded-lg border bg-card text-card-foreground shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Input Text</h2>
                    <TextInput value={text} onChange={setText} />
                  </div>
                </div>
                <div className="rounded-lg border bg-card text-card-foreground shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Preview</h2>
                    <CanvasOutput text={text} settings={settings} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="draw">
                <DrawingPanel className="w-full" settings={settings} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            <CustomizationPanel settings={settings} onSettingsChange={setSettings} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
