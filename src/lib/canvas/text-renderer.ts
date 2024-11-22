import type { HandwritingSettings } from "@/types"

interface TextMeasurements {
  width: number
  height: number
  lineHeight: number
  lines: string[]
}

export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  settings: HandwritingSettings
): TextMeasurements {
  const {
    fontSize,
    lineHeight,
    letterSpacing,
    wordSpacing,
    currentFont,
    topPadding,
    paperMargins,
  } = settings

  // Set font and text properties
  ctx.font = `${fontSize}px "${currentFont.name}"`
  ctx.textBaseline = "top"

  // Split text into words and calculate word widths
  const words = text.split(/\s+/)
  const wordWidths = words.map((word) => {
    const letters = Array.from(word)
    return letters.reduce((width, letter, index) => {
      const letterWidth = ctx.measureText(letter).width
      return width + letterWidth + (index < letters.length - 1 ? letterSpacing : 0)
    }, 0)
  })

  // Calculate line breaks
  const lines: string[] = []
  let currentLine: string[] = []
  let currentWidth = 0
  const maxWidth = ctx.canvas.width - (paperMargins ? 80 : 20)

  words.forEach((word, index) => {
    const wordWidth = wordWidths[index]
    const spaceWidth = wordSpacing

    if (currentWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0) <= maxWidth) {
      currentLine.push(word)
      currentWidth += wordWidth + (currentLine.length > 1 ? spaceWidth : 0)
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine.join(" "))
      }
      currentLine = [word]
      currentWidth = wordWidth
    }
  })

  if (currentLine.length > 0) {
    lines.push(currentLine.join(" "))
  }

  // Calculate total height
  const actualLineHeight = lineHeight || fontSize * 1.2
  const totalHeight = lines.length * actualLineHeight + topPadding

  return {
    width: maxWidth,
    height: totalHeight,
    lineHeight: actualLineHeight,
    lines,
  }
}

export function renderText(
  ctx: CanvasRenderingContext2D,
  text: string,
  settings: HandwritingSettings
): void {
  const {
    fontSize,
    letterSpacing,
    wordSpacing,
    currentFont,
    inkColor,
    topPadding,
    paperLines,
    paperMargins,
  } = settings

  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw paper background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  // Draw paper lines if enabled
  if (paperLines) {
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    const lineSpacing = fontSize * 1.5

    for (let y = topPadding; y < ctx.canvas.height; y += lineSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(ctx.canvas.width, y)
      ctx.stroke()
    }
  }

  // Draw margins if enabled
  if (paperMargins) {
    ctx.strokeStyle = "#ef4444"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 0)
    ctx.lineTo(40, ctx.canvas.height)
    ctx.stroke()
  }

  // Set text properties
  ctx.font = `${fontSize}px "${currentFont.name}"`
  ctx.fillStyle = inkColor
  ctx.textBaseline = "top"

  // Measure and render text
  const { lines, lineHeight } = measureText(ctx, text, settings)
  let y = topPadding

  lines.forEach((line) => {
    let x = paperMargins ? 60 : 10
    const letters = Array.from(line)

    letters.forEach((letter, index) => {
      ctx.fillText(letter, x, y)
      x += ctx.measureText(letter).width + letterSpacing

      // Add word spacing after spaces
      if (letter === " " && index < letters.length - 1) {
        x += wordSpacing
      }
    })

    y += lineHeight
  })
}