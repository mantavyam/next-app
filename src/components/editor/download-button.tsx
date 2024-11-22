"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"
import { exportCanvasAsImage } from "@/lib/utils/image-processor"
import { exportCanvasAsPDF } from "@/lib/utils/pdf-generator"
import type { HandwritingSettings } from "@/types"

interface DownloadButtonProps {
  canvas: HTMLCanvasElement | null
  settings: HandwritingSettings
  className?: string
}

export function DownloadButton({
  canvas,
  settings,
  className,
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "png" | "jpeg" | "pdf") => {
    if (!canvas || isExporting) return

    const toastId = toast.loading(`Exporting as ${format.toUpperCase()}...`)
    setIsExporting(true)

    try {
      if (format === "pdf") {
        await exportCanvasAsPDF(canvas, settings)
        toast.success("PDF exported successfully", { id: toastId })
      } else {
        await exportCanvasAsImage(canvas, { type: format })
        toast.success(`${format.toUpperCase()} exported successfully`, {
          id: toastId,
        })
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error)
      toast.error(`Failed to export as ${format.toUpperCase()}`, {
        id: toastId,
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={className}
          disabled={!canvas || isExporting}
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isExporting}
          onClick={() => handleExport("png")}
        >
          Download as PNG
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isExporting}
          onClick={() => handleExport("jpeg")}
        >
          Download as JPEG
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isExporting}
          onClick={() => handleExport("pdf")}
        >
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
