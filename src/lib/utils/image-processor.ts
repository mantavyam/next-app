import { getCanvasBlob, getCanvasDataURL } from "../canvas/drawing-utils"

export interface ImageExportOptions {
  type?: "png" | "jpeg"
  quality?: number
  fileName?: string
}

const defaultOptions: ImageExportOptions = {
  type: "png",
  quality: 0.95,
  fileName: "handwriting"
}

export async function exportCanvasAsImage(
  canvas: HTMLCanvasElement,
  options: Partial<ImageExportOptions> = {}
): Promise<void> {
  const { type, quality, fileName } = { ...defaultOptions, ...options }
  const mimeType = `image/${type}`

  try {
    // Create a blob from the canvas
    const blob = await getCanvasBlob(canvas, mimeType, quality)

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileName}.${type}`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Failed to export image:", error)
    throw new Error("Failed to export image")
  }
}

export function canvasToDataURL(
  canvas: HTMLCanvasElement,
  options: Partial<ImageExportOptions> = {}
): string {
  const { type, quality } = { ...defaultOptions, ...options }
  return getCanvasDataURL(canvas, `image/${type}`, quality)
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous" // Enable CORS for external images
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
}

export function resizeImage(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = image.width
  let height = image.height

  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  return { width, height }
}

export function createThumbnail(
  canvas: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
): string {
  const thumbnailCanvas = document.createElement("canvas")
  const ctx = thumbnailCanvas.getContext("2d")
  if (!ctx) throw new Error("Failed to get canvas context")

  const { width, height } = resizeImage(canvas, maxWidth, maxHeight)
  thumbnailCanvas.width = width
  thumbnailCanvas.height = height

  ctx.drawImage(canvas, 0, 0, width, height)
  return thumbnailCanvas.toDataURL("image/jpeg", 0.7)
}