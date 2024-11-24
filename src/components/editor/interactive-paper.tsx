"use client"

import { useEffect, useRef, useState } from "react"
import { useFontLoader } from "@/hooks/use-font-loader"
import { renderText } from "@/lib/canvas/text-renderer"
import type { HandwritingSettings } from '@/types'
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"

interface InteractivePaperProps {
  settings: HandwritingSettings
  onChange?: (text: string) => void
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794 // 210mm at 96 DPI
const A4_HEIGHT = 1123 // 297mm at 96 DPI

export function InteractivePaper({ settings, onChange }: InteractivePaperProps) {
  const [text, setText] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { loadFont, isLoading } = useFontLoader()
  const [fontLoaded, setFontLoaded] = useState(false)

  // Load font when component mounts or font changes
  useEffect(() => {
    let mounted = true

    async function loadAndRender() {
      try {
        if (!settings.currentFont) {
          toast.error("No font selected")
          return
        }

        setFontLoaded(false)
        await loadFont(settings.currentFont)
        
        if (mounted) {
          setFontLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load font:', error)
        toast.error("Failed to load font", {
          description: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    loadAndRender()

    return () => {
      mounted = false
    }
  }, [settings.currentFont, loadFont])

  // Render text on canvas
  useEffect(() => {
    if (!canvasRef.current || !fontLoaded || isLoading) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    // Clear canvas
    context.clearRect(0, 0, A4_WIDTH, A4_HEIGHT)

    // Draw paper background
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

    // Draw paper lines if enabled
    if (settings.paperLines) {
      const lineHeight = settings.lineHeight || 32
      const lineColor = settings.lineColor || "#e5e7eb"
      const lineOpacity = settings.lineOpacity || 100
      
      context.strokeStyle = lineColor
      context.globalAlpha = lineOpacity / 100
      context.lineWidth = settings.lineWidth || 1

      for (let y = settings.topPadding + 40; y < A4_HEIGHT - 40; y += lineHeight) {
        context.beginPath()
        context.moveTo(40, y)
        context.lineTo(A4_WIDTH - 40, y)
        context.stroke()
      }

      context.globalAlpha = 1
    }

    // Draw margin line if enabled
    if (settings.paperMargins) {
      const marginColor = settings.marginColor || "#ef4444"
      context.strokeStyle = marginColor
      context.lineWidth = 1
      context.beginPath()
      context.moveTo(60, 40)
      context.lineTo(60, A4_HEIGHT - 40)
      context.stroke()
    }

    // Render text if any
    if (text.trim()) {
      try {
        renderText(context, text, {
          ...settings,
          maxWidth: A4_WIDTH - 80,
          startX: 80,
          startY: settings.topPadding + 40,
        })
      } catch (error) {
        console.error('Failed to render text:', error)
      }
    }
  }, [text, settings, fontLoaded, isLoading])

  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    onChange?.(newText)
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: `${A4_WIDTH}/${A4_HEIGHT}` }}>
      <canvas
        ref={canvasRef}
        width={A4_WIDTH}
        height={A4_HEIGHT}
        className="w-full h-full bg-white shadow-lg"
      />
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleTextChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none"
        placeholder="Start typing to see handwriting..."
      />
    </div>
  )
}
