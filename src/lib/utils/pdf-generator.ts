import jsPDF from "jspdf"
import type { HandwritingSettings } from "@/types"

export interface PDFExportOptions {
  fileName?: string
  pageSize?: "a4" | "letter"
  orientation?: "portrait" | "landscape"
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const defaultOptions: PDFExportOptions = {
  fileName: "handwriting",
  pageSize: "a4",
  orientation: "portrait",
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
}

export async function exportCanvasAsPDF(
  canvas: HTMLCanvasElement,
  settings: HandwritingSettings,
  options: Partial<PDFExportOptions> = {}
): Promise<void> {
  const { fileName, pageSize, orientation, margins } = {
    ...defaultOptions,
    ...options,
  }

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: pageSize,
    })

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Calculate content area
    const contentWidth = pageWidth - margins!.left - margins!.right
    const contentHeight = pageHeight - margins!.top - margins!.bottom

    // Get canvas aspect ratio
    const canvasRatio = canvas.width / canvas.height

    // Calculate image dimensions to fit content area while maintaining aspect ratio
    let imageWidth = contentWidth
    let imageHeight = imageWidth / canvasRatio

    if (imageHeight > contentHeight) {
      imageHeight = contentHeight
      imageWidth = imageHeight * canvasRatio
    }

    // Convert canvas to data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.95)

    // Add paper lines if enabled
    if (settings.paperLines) {
      addPaperLines(pdf, margins!, pageHeight)
    }

    // Add paper margins if enabled
    if (settings.paperMargins) {
      addPaperMargins(pdf, margins!, pageWidth, pageHeight)
    }

    // Add the image
    pdf.addImage(
      imageData,
      "JPEG",
      margins!.left,
      margins!.top,
      imageWidth,
      imageHeight
    )

    // Save the PDF
    pdf.save(`${fileName}.pdf`)
  } catch (error) {
    console.error("Failed to export PDF:", error)
    throw new Error("Failed to export PDF")
  }
}

function addPaperLines(
  pdf: jsPDF,
  margins: { top: number; bottom: number },
  pageHeight: number
) {
  const lineSpacing = 8 // 8mm between lines
  const y1 = margins.top
  const y2 = pageHeight - margins.bottom

  pdf.setDrawColor(200, 200, 200) // Light gray
  pdf.setLineWidth(0.1)

  for (let y = margins.top; y < pageHeight - margins.bottom; y += lineSpacing) {
    pdf.line(margins.left, y, pageHeight - margins.right, y)
  }
}

function addPaperMargins(
  pdf: jsPDF,
  margins: { left: number; right: number; top: number; bottom: number },
  pageWidth: number,
  pageHeight: number
) {
  pdf.setDrawColor(255, 0, 0) // Red margin line
  pdf.setLineWidth(0.2)

  // Left margin
  pdf.line(margins.left, 0, margins.left, pageHeight)

  // Right margin
  const rightMargin = pageWidth - margins.right
  pdf.line(rightMargin, 0, rightMargin, pageHeight)

  // Top margin
  pdf.line(0, margins.top, pageWidth, margins.top)

  // Bottom margin
  const bottomMargin = pageHeight - margins.bottom
  pdf.line(0, bottomMargin, pageWidth, bottomMargin)
}