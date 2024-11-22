"use client"

import { useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { useFontLoader } from "@/hooks/use-font-loader"
import type { Font } from "@/types"

interface FontUploadProps {
  onFontUpload: (font: Font) => void
}

export function FontUpload({ onFontUpload }: FontUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { isLoading, loadFont } = useFontLoader()

  const validateFontFile = (file: File): boolean => {
    const validTypes = ["font/ttf", "font/otf", "application/x-font-ttf", "application/x-font-otf"]
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid font file", {
        description: "Please upload a TTF or OTF font file.",
      })
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Font file must be less than 5MB.",
      })
      return false
    }
    return true
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!validateFontFile(file)) {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    const toastId = toast.loading("Loading font...")

    try {
      const fontUrl = URL.createObjectURL(file)
      const fontName = file.name.replace(/\.[^/.]+$/, "")
      const font: Font = {
        name: fontName,
        url: fontUrl,
        style: `font-family: "${fontName}";`,
      }

      await loadFont(font)
      onFontUpload(font)

      toast.success("Font uploaded successfully", {
        id: toastId,
        description: `${font.name} is now available for use.`,
      })
    } catch (error) {
      toast.error("Failed to load font", {
        id: toastId,
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-2" role="region" aria-label="Font upload section">
      <Label htmlFor="font-upload">Upload Custom Font</Label>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id="font-upload"
          type="file"
          accept=".ttf,.otf"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
          aria-label="Choose font file"
          aria-describedby="font-upload-help"
        />
        <Button
          variant="outline"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
          className="w-full"
          aria-controls="font-upload"
          aria-expanded="false"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{isLoading ? "Loading..." : "Upload Font"}</span>
        </Button>
      </div>
      <p
        className="text-xs text-muted-foreground"
        id="font-upload-help"
        role="note"
      >
        Supports TTF and OTF fonts up to 5MB
      </p>
    </div>
  )
}
