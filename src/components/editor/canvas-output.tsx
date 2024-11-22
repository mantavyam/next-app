"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Eraser, Pen, Undo } from "lucide-react"
import { useCanvas } from "@/hooks/use-canvas"
import { renderText } from "@/lib/canvas/text-renderer"
import { getCanvasPoint, setCanvasSize } from "@/lib/canvas/drawing-utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import type { HandwritingSettings } from "@/types"

interface CanvasOutputProps {
  text: string
  settings: HandwritingSettings
}

export function CanvasOutput({ text, settings }: CanvasOutputProps) {
  const {
    canvasRef,
    canvasState,
    drawingOptions,
    setDrawingOptions,
    clearCanvas,
  } = useCanvas()

  // Initialize canvas size and render text
  useEffect(() => {
    if (!canvasRef.current) return

    // Set canvas size to A4 proportions (1:1.4142)
    const width = canvasRef.current.offsetWidth
    const height = width * 1.4142
    setCanvasSize(canvasRef.current, width, height, window.devicePixelRatio)

    // Get context and render
    const context = canvasRef.current.getContext("2d")
    if (!context) return

    // Render text with settings
    renderText(context, text, settings)
  }, [text, settings, canvasRef])

  // Update drawing options when ink color changes
  useEffect(() => {
    setDrawingOptions(prev => ({
      ...prev,
      color: settings.inkColor,
    }))
  }, [settings.inkColor, setDrawingOptions])

  // Handle pointer events for drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      const point = getCanvasPoint(e as any, canvas)
      canvas.setPointerCapture(e.pointerId)
      
      if (drawingOptions.tool === "pen" || drawingOptions.tool === "eraser") {
        const context = canvas.getContext("2d")
        if (!context) return

        context.beginPath()
        context.moveTo(point.x, point.y)
        context.lineCap = "round"
        context.lineJoin = "round"
        context.strokeStyle = drawingOptions.color
        context.lineWidth = drawingOptions.tool === "eraser" 
          ? drawingOptions.lineWidth * 2 
          : drawingOptions.lineWidth

        if (drawingOptions.tool === "eraser") {
          context.globalCompositeOperation = "destination-out"
        }
      }
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault()
      if (e.buttons !== 1) return // Only draw when primary button is pressed

      const point = getCanvasPoint(e as any, canvas)
      const context = canvas.getContext("2d")
      if (!context) return

      if (drawingOptions.tool === "pen" || drawingOptions.tool === "eraser") {
        context.lineTo(point.x, point.y)
        context.stroke()
      }
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault()
      const context = canvas.getContext("2d")
      if (!context) return

      if (drawingOptions.tool === "pen" || drawingOptions.tool === "eraser") {
        context.closePath()
        if (drawingOptions.tool === "eraser") {
          context.globalCompositeOperation = "source-over"
        }
      }
    }

    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
    }
  }, [canvasRef, drawingOptions])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Output</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={clearCanvas}
            disabled={!text}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (!canvasRef.current) return
              const link = document.createElement("a")
              link.download = "handwriting.png"
              link.href = canvasRef.current.toDataURL("image/png")
              link.click()
            }}
            disabled={!text}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Drawing Tools</Label>
          <ToggleGroup
            type="single"
            value={drawingOptions.tool}
            onValueChange={(value) => {
              if (value) {
                setDrawingOptions(prev => ({ ...prev, tool: value as "pen" | "eraser" }))
              }
            }}
          >
            <ToggleGroupItem value="pen" aria-label="Pen tool">
              <Pen className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="eraser" aria-label="Eraser tool">
              <Eraser className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label>Line Width</Label>
          <Slider
            value={[drawingOptions.lineWidth]}
            min={1}
            max={10}
            step={1}
            onValueChange={([value]) => {
              setDrawingOptions(prev => ({ ...prev, lineWidth: value }))
            }}
          />
        </div>

        <div className="relative aspect-[1/1.4142] w-full">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none bg-white"
          />
        </div>
      </CardContent>
    </Card>
  )
}