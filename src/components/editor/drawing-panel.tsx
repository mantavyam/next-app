"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Eraser, Pen, Undo2, RotateCcw } from "lucide-react"
import {
  drawLine,
  clearCanvas,
  getCanvasPoint,
  setCanvasSize,
} from "@/lib/canvas/drawing-utils"
import { DownloadButton } from "./download-button"
import type { DrawingOptions, Point, HandwritingSettings } from "@/types"

interface DrawingPanelProps {
  width?: number
  height?: number
  className?: string
  settings: HandwritingSettings
}

export function DrawingPanel({
  width = 800,
  height = 600,
  className,
  settings,
}: DrawingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    color: "#000000",
    lineWidth: 2,
    tool: "pen",
  })
  const historyRef = useRef<ImageData[]>([])
  const historyIndexRef = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    setCanvasSize(canvas, width, height, window.devicePixelRatio)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      clearCanvas(ctx, width, height)
      saveState()
    }
  }, [width, height])

  const saveState = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Remove any states after current index if we're in middle of history
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    
    // Add current state
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    historyIndexRef.current++
  }

  const undo = () => {
    if (historyIndexRef.current <= 0) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    historyIndexRef.current--
    const imageData = historyRef.current[historyIndexRef.current]
    ctx.putImageData(imageData, 0, 0)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    clearCanvas(ctx, width, height)
    saveState()
  }

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const point = getCanvasPoint(event.nativeEvent, canvas)
    setLastPoint(point)
  }

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!isDrawing || !canvas || !ctx || !lastPoint) return

    const currentPoint = getCanvasPoint(event.nativeEvent, canvas)
    drawLine(ctx, lastPoint, currentPoint, drawingOptions)
    setLastPoint(currentPoint)
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setLastPoint(null)
      saveState()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Drawing Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={drawingOptions.tool === "pen" ? "default" : "outline"}
              size="icon"
              onClick={() =>
                setDrawingOptions((prev) => ({ ...prev, tool: "pen" }))
              }
            >
              <Pen className="h-4 w-4" />
            </Button>
            <Button
              variant={drawingOptions.tool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() =>
                setDrawingOptions((prev) => ({ ...prev, tool: "eraser" }))
              }
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={undo}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={clear}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <DownloadButton
              canvas={canvasRef.current}
              settings={settings}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Width</Label>
            <Slider
              value={[drawingOptions.lineWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={([value]) =>
                setDrawingOptions((prev) => ({ ...prev, lineWidth: value }))
              }
            />
          </div>

          <canvas
            ref={canvasRef}
            className="border rounded-lg touch-none"
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </CardContent>
    </Card>
  )
}