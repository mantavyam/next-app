import type { Point, DrawingOptions } from "@/types"

export function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
  options: DrawingOptions
) {
  const { color, lineWidth, tool } = options

  ctx.save()
  ctx.beginPath()
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.strokeStyle = color
  ctx.lineWidth = tool === "eraser" ? lineWidth * 2 : lineWidth

  // If pressure is available, use it to modify line width
  if (start.pressure) {
    ctx.lineWidth *= start.pressure
  }

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out"
  } else {
    ctx.globalCompositeOperation = "source-over"
  }

  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
  ctx.restore()
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height)
}

export function getCanvasPoint(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height

  if (event instanceof MouseEvent) {
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
  } else {
    const touch = event.touches[0]
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
      pressure: touch.force
    }
  }
}

export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width?: number,
  height?: number
) {
  if (width && height) {
    ctx.drawImage(image, x, y, width, height)
  } else {
    ctx.drawImage(image, x, y)
  }
}

export function setCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scale = 1
) {
  canvas.width = width * scale
  canvas.height = height * scale
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext("2d")
  if (ctx) {
    ctx.scale(scale, scale)
  }
}

export function getCanvasBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Canvas to Blob conversion failed"))
        }
      },
      type,
      quality
    )
  })
}

export function getCanvasDataURL(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.95
): string {
  return canvas.toDataURL(type, quality)
}