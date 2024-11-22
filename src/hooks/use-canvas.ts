import { useCallback, useEffect, useRef, useState } from "react"
import type { CanvasState, DrawingOptions, Point } from "@/types"

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    width: 0,
    height: 0,
    scale: 1,
    isDirty: false,
  })
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    color: "#000000",
    lineWidth: 2,
    tool: "pen",
  })

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    // Set canvas size
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Configure context
    context.scale(window.devicePixelRatio, window.devicePixelRatio)
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = drawingOptions.color
    context.lineWidth = drawingOptions.lineWidth

    contextRef.current = context
    setCanvasState(prev => ({
      ...prev,
      width,
      height,
      scale: window.devicePixelRatio,
    }))
  }, [drawingOptions.color, drawingOptions.lineWidth])

  const startDrawing = useCallback(
    (point: Point) => {
      const context = contextRef.current
      if (!context) return

      context.beginPath()
      context.moveTo(point.x, point.y)
      setIsDrawing(true)
      setCanvasState(prev => ({ ...prev, isDirty: true }))
    },
    []
  )

  const draw = useCallback(
    (point: Point) => {
      if (!isDrawing || !contextRef.current) return

      const context = contextRef.current
      context.lineTo(point.x, point.y)
      context.stroke()
    },
    [isDrawing]
  )

  const stopDrawing = useCallback(() => {
    const context = contextRef.current
    if (!context) return

    context.closePath()
    setIsDrawing(false)
  }, [])

  const clearCanvas = useCallback(() => {
    const context = contextRef.current
    const canvas = canvasRef.current
    if (!context || !canvas) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setCanvasState(prev => ({ ...prev, isDirty: false }))
  }, [])

  useEffect(() => {
    initializeCanvas()
    window.addEventListener("resize", initializeCanvas)
    return () => window.removeEventListener("resize", initializeCanvas)
  }, [initializeCanvas])

  return {
    canvasRef,
    canvasState,
    drawingOptions,
    setDrawingOptions,
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
  }
}