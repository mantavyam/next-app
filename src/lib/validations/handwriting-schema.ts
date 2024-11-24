import * as z from "zod"

export const fontSchema = z.object({
  name: z.string().min(1, "Font name is required"),
  url: z.string().url("Invalid font URL"),
  style: z.string(),
})

export const handwritingSettingsSchema = z.object({
  fontSize: z
    .number()
    .min(8, "Font size must be at least 8")
    .max(72, "Font size must be at most 72"),
  lineHeight: z
    .number()
    .min(1, "Line height must be at least 1")
    .max(100, "Line height must be at most 100"),
  letterSpacing: z
    .number()
    .min(-5, "Letter spacing must be at least -5")
    .max(20, "Letter spacing must be at most 20"),
  wordSpacing: z
    .number()
    .min(0, "Word spacing must be at least 0")
    .max(50, "Word spacing must be at most 50"),
  topPadding: z
    .number()
    .min(0, "Top padding must be at least 0")
    .max(100, "Top padding must be at most 100"),
  paperMargins: z.boolean(),
  paperLines: z.boolean(),
  inkColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  currentFont: fontSchema,
  lineColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
  lineOpacity: z.number().min(0).max(100).optional(),
  lineWidth: z.number().min(0.5).max(3).optional(),
  lineSpacing: z.number().min(16).max(48).optional(),
  marginColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format").optional(),
})

export const textInputSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(5000, "Text must be at most 5000 characters"),
})

export type HandwritingSettingsSchema = z.infer<typeof handwritingSettingsSchema>
export type TextInputSchema = z.infer<typeof textInputSchema>
export type FontSchema = z.infer<typeof fontSchema>
