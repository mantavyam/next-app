"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileDown, Undo } from "lucide-react"
import { renderText } from "@/lib/canvas/text-renderer"
import type { HandwritingSettings } from '@/types'
import { jsPDF } from 'jspdf'
import { useFontLoader } from "@/hooks/use-font-loader"
import { toast } from "sonner"
import { debounce } from "@/lib/utils"

interface CanvasOutputProps {
  text: string
  settings: HandwritingSettings
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794 // 210mm at 96 DPI
const A4_HEIGHT = 1123 // 297mm at 96 DPI

export function CanvasOutput({ text, settings }: CanvasOutputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<ImageData[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [pages, setPages] = useState<HTMLCanvasElement[]>([])
  const { loadFont, isLoading, error } = useFontLoader()
  const [fontLoaded, setFontLoaded] = useState(false)
  const [renderingText, setRenderingText] = useState(false)
  const prevTextRef = useRef(text)
  const prevSettingsRef = useRef(settings)

  // Load font when component mounts or font changes
  useEffect(() => {
    let mounted = true

    async function loadAndRender() {
      try {
        if (!settings.currentFont) {
          toast.error("No font selected")
          return
        }

        if (!fontLoaded) {
          setFontLoaded(false)
          await loadFont(settings.currentFont)
          if (mounted) {
            setFontLoaded(true)
          }
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
  }, [settings.currentFont, loadFont, fontLoaded])

  // Show immediate feedback while typing
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    // Clear canvas and show loading state
    context.clearRect(0, 0, A4_WIDTH, A4_HEIGHT)
    
    if (text.trim()) {
      context.font = '16px Arial'
      context.fillStyle = '#666'
      context.fillText(fontLoaded ? 'Rendering...' : 'Loading font...', 40, 40)
    }
  }, [text, fontLoaded])

  // Debounced render function for performance
  const debouncedRender = useCallback(
    debounce(async () => {
      if (!canvasRef.current || !fontLoaded || isLoading) return
      
      // Skip if text and settings haven't changed
      if (text === prevTextRef.current && 
          JSON.stringify(settings) === JSON.stringify(prevSettingsRef.current) &&
          pages.length > 0) {
        return
      }

      setRenderingText(true)
      try {
        const canvas = canvasRef.current
        canvas.width = A4_WIDTH
        canvas.height = A4_HEIGHT
        
        const context = canvas.getContext('2d')
        if (!context) {
          toast.error("Could not get canvas context")
          return
        }

        // Calculate pages in a web worker or async task
        const { newPages, error } = await calculatePages(text, settings)
        if (error) {
          toast.error("Failed to calculate pages", {
            description: error.message
          })
          return
        }

        setPages(newPages)

        // Update main canvas with first page
        if (newPages[0]) {
          context.clearRect(0, 0, A4_WIDTH, A4_HEIGHT)
          context.drawImage(newPages[0], 0, 0)

          const initialState = context.getImageData(0, 0, canvas.width, canvas.height)
          setHistory([initialState])
          setCurrentStep(0)
        }

        // Update refs for change detection
        prevTextRef.current = text
        prevSettingsRef.current = settings
      } catch (error) {
        console.error('Failed to render text:', error)
        toast.error("Failed to render text", {
          description: error instanceof Error ? error.message : "Unknown error"
        })
      } finally {
        setRenderingText(false)
      }
    }, 300),
    [text, settings, fontLoaded, isLoading, pages.length]
  )

  // Re-render when text or settings change
  useEffect(() => {
    debouncedRender()
  }, [debouncedRender])

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!canvasRef.current || currentStep === 0) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return

    const previousStep = currentStep - 1
    if (previousStep >= 0 && history[previousStep]) {
      context.putImageData(history[previousStep], 0, 0)
      setCurrentStep(previousStep)
    }
  }, [currentStep, history])

  // Handle PNG download
  const handlePNGDownload = useCallback(() => {
    if (pages.length === 0) return

    if (pages.length === 1) {
      // Single page download
      const link = document.createElement("a")
      link.download = "handwriting.png"
      link.href = pages[0].toDataURL("image/png")
      link.click()
    } else {
      // Multiple pages download as ZIP
      // For now, we'll download the first page
      const link = document.createElement("a")
      link.download = "handwriting-page1.png"
      link.href = pages[0].toDataURL("image/png")
      link.click()
    }
  }, [pages])

  // Handle PDF download
  const handlePDFDownload = useCallback(() => {
    if (pages.length === 0) return

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })

      pages.forEach((page, index) => {
        if (index > 0) pdf.addPage()
        const imgData = page.toDataURL('image/jpeg', 1.0)
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      })

      pdf.save("handwriting.pdf")
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      toast.error("Failed to generate PDF", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }, [pages])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] bg-white rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading font...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] bg-white rounded-lg">
        <div className="text-center text-red-500">
          <p className="text-sm">Failed to load font: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleUndo}
          disabled={currentStep === 0 || !fontLoaded}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePNGDownload}
          disabled={!text || !fontLoaded}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePDFDownload}
          disabled={!text || !fontLoaded}
        >
          <FileDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative w-full overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
          {pages.map((page, index) => (
            <div
              key={index}
              className="relative w-full mb-4 last:mb-0"
              style={{
                aspectRatio: `${A4_WIDTH} / ${A4_HEIGHT}`,
              }}
            >
              <canvas
                ref={index === 0 ? canvasRef : undefined}
                width={A4_WIDTH}
                height={A4_HEIGHT}
                className="w-full h-auto touch-none"
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </div>
          ))}
          {pages.length === 0 && text && (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <p className="text-sm text-gray-600">Type something to see the preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Calculate pages in a web worker or async task
async function calculatePages(text: string, settings: HandwritingSettings) {
  // Calculate how many pages we need based on text content and line height
  const context = document.createElement('canvas').getContext('2d')
  if (!context) {
    throw new Error('Could not get canvas context')
  }

  context.font = `${settings.fontSize}px "${settings.currentFont.name}"`
  const metrics = context.measureText('M')
  const lineHeight = settings.lineHeight || metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const textLines = text.split('\n')
  const linesPerPage = Math.floor((A4_HEIGHT - 80) / lineHeight)
  const totalPages = Math.max(1, Math.ceil(textLines.length / linesPerPage))

  // Create canvases for each page
  const newPages = Array.from({ length: totalPages }, () => {
    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = A4_WIDTH
    pageCanvas.height = A4_HEIGHT
    return pageCanvas
  })

  // Render text on each page
  await Promise.all(newPages.map(async (pageCanvas, index) => {
    const ctx = pageCanvas.getContext('2d')
    if (!ctx) return

    // Calculate which lines belong to this page
    const startLine = index * linesPerPage
    const endLine = Math.min((index + 1) * linesPerPage, textLines.length)
    const pageText = textLines.slice(startLine, endLine).join('\n')

    // Render the page
    renderText(ctx, pageText, {
      ...settings,
      maxWidth: A4_WIDTH - 80,
      startX: 40,
      startY: settings.topPadding + 40,
      paperWidth: A4_WIDTH,
      paperHeight: A4_HEIGHT,
      lineColor: settings.lineColor || "#e5e7eb",
      lineOpacity: settings.lineOpacity || 100,
      lineWidth: settings.lineWidth || 1,
      lineSpacing: settings.lineSpacing || 24,
      marginColor: settings.marginColor || "#ef4444",
      handleNewLine: (x, y) => {
        if (y + lineHeight > A4_HEIGHT - 40) {
          return { x: 40, y: settings.topPadding + 40 }
        }
        return { x: 40, y: y + lineHeight }
      }
    })
  }))

  return { newPages, error: null }
}