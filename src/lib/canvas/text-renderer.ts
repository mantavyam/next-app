import type { HandwritingSettings } from "@/types"

interface TextMeasurements {
  width: number
  height: number
  lineHeight: number
  lines: string[]
}

interface RenderOptions extends HandwritingSettings {
  maxWidth?: number
  startX?: number
  startY?: number
  paperWidth?: number
  paperHeight?: number
  handleNewLine?: (x: number, y: number) => { x: number; y: number }
}

export function measureText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: RenderOptions
): TextMeasurements {
  const {
    fontSize,
    lineHeight,
    letterSpacing,
    wordSpacing,
    currentFont,
    maxWidth = ctx.canvas.width - 80,
  } = options

  // Set font and text properties
  ctx.font = `${fontSize}px "${currentFont.name}"`
  ctx.textBaseline = "top"

  // Split text into lines first (handle manual line breaks)
  const textLines = text.split(/\\r?\\n/)
  const lines: string[] = []
  let totalHeight = 0
  let maxLineWidth = 0

  textLines.forEach(textLine => {
    // Split line into words and calculate word widths
    const words = textLine.split(/\\s+/).filter(word => word.length > 0)
    const wordWidths = words.map((word) => {
      const letters = Array.from(word)
      return letters.reduce((width, letter, index) => {
        const letterWidth = ctx.measureText(letter).width
        return width + letterWidth + (index < letters.length - 1 ? letterSpacing : 0)
      }, 0)
    })

    // Calculate line breaks within each text line
    let currentLine: string[] = []
    let currentWidth = 0

    words.forEach((word, index) => {
      const wordWidth = wordWidths[index]
      const spaceWidth = wordSpacing

      // Check if word fits in current line
      if (currentWidth + wordWidth + (currentLine.length > 0 ? spaceWidth : 0) <= maxWidth) {
        currentLine.push(word)
        currentWidth += wordWidth + (currentLine.length > 1 ? spaceWidth : 0)
      } else {
        // If word is too long, split it
        if (wordWidth > maxWidth) {
          // If we have a current line, add it first
          if (currentLine.length > 0) {
            lines.push(currentLine.join(" "))
            totalHeight += lineHeight
            maxLineWidth = Math.max(maxLineWidth, currentWidth)
            currentLine = []
            currentWidth = 0
          }

          // Split long word into characters
          let currentPart: string[] = []
          let partWidth = 0
          Array.from(word).forEach((char) => {
            const charWidth = ctx.measureText(char).width + letterSpacing
            if (partWidth + charWidth <= maxWidth) {
              currentPart.push(char)
              partWidth += charWidth
            } else {
              lines.push(currentPart.join(""))
              totalHeight += lineHeight
              maxLineWidth = Math.max(maxLineWidth, partWidth)
              currentPart = [char]
              partWidth = charWidth
            }
          })
          if (currentPart.length > 0) {
            currentLine = [currentPart.join("")]
            currentWidth = partWidth
          }
        } else {
          // Normal word wrapping
          if (currentLine.length > 0) {
            lines.push(currentLine.join(" "))
            totalHeight += lineHeight
            maxLineWidth = Math.max(maxLineWidth, currentWidth)
          }
          currentLine = [word]
          currentWidth = wordWidth
        }
      }
    })

    // Add remaining line if any
    if (currentLine.length > 0) {
      lines.push(currentLine.join(" "))
      totalHeight += lineHeight
      maxLineWidth = Math.max(maxLineWidth, currentWidth)
    }

    // Add an empty line for manual line breaks
    if (textLine === "") {
      lines.push("")
      totalHeight += lineHeight
    }
  })

  return {
    width: maxLineWidth,
    height: totalHeight,
    lineHeight,
    lines,
  }
}

export function renderText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: RenderOptions
): void {
  const {
    fontSize,
    letterSpacing,
    wordSpacing,
    currentFont,
    inkColor = "#000000",
    topPadding,
    paperLines,
    paperMargins,
    lineColor = "#e5e7eb",
    lineOpacity = 100,
    lineWidth = 1,
    lineSpacing = 24,
    marginColor = "#ef4444",
    maxWidth = ctx.canvas.width - (paperMargins ? 80 : 20),
    startX = paperMargins ? 60 : 10,
    startY = topPadding,
    paperWidth = ctx.canvas.width,
    paperHeight = ctx.canvas.height,
    handleNewLine,
  } = options

  // Clear canvas
  ctx.clearRect(0, 0, paperWidth, paperHeight)

  // Draw paper background
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, paperWidth, paperHeight)

  // Draw paper lines if enabled
  if (paperLines) {
    ctx.strokeStyle = lineColor
    ctx.globalAlpha = lineOpacity / 100
    ctx.lineWidth = lineWidth
    
    for (let y = topPadding; y < paperHeight; y += lineSpacing) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(paperWidth, y)
      ctx.stroke()
    }
    
    ctx.globalAlpha = 1
  }

  // Draw margins if enabled
  if (paperMargins) {
    ctx.strokeStyle = marginColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 0)
    ctx.lineTo(40, paperHeight)
    ctx.stroke()
  }

  // Set text properties
  ctx.font = `${fontSize}px "${currentFont.name}"`
  ctx.fillStyle = inkColor
  ctx.textBaseline = "top"

  // Measure and render text
  const { lines, lineHeight } = measureText(ctx, text, options)
  let x = startX
  let y = startY

  lines.forEach((line) => {
    // Handle new line position
    if (handleNewLine) {
      const newPos = handleNewLine(x, y)
      x = newPos.x
      y = newPos.y
    } else {
      x = startX
    }

    // Handle empty lines (manual line breaks)
    if (line === "") {
      y += lineHeight
      return
    }

    const letters = Array.from(line)
    letters.forEach((letter, index) => {
      // Check if we need to wrap to next line
      const letterWidth = ctx.measureText(letter).width
      if (x + letterWidth > maxWidth + startX) {
        if (handleNewLine) {
          const newPos = handleNewLine(x, y)
          x = newPos.x
          y = newPos.y
        } else {
          x = startX
          y += lineHeight
        }
      }

      ctx.fillText(letter, x, y)
      x += letterWidth + letterSpacing

      // Add word spacing after spaces
      if (letter === " " && index < letters.length - 1) {
        x += wordSpacing
      }
    })

    y += lineHeight
  })
}