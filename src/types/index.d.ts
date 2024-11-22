export interface HandwritingSettings {
  fontSize: number
  lineHeight: number
  letterSpacing: number
  wordSpacing: number
  topPadding: number
  paperMargins: boolean
  paperLines: boolean
  inkColor: string
  currentFont: Font
}

export interface FontSettings {
  currentFont: string
  customFonts: Font[]
}

export interface Font {
  name: string
  url: string
  style: string
}

export interface CanvasState {
  width: number
  height: number
  scale: number
  isDirty: boolean
}

export interface DrawingOptions {
  color: string
  lineWidth: number
  tool: 'pen' | 'eraser'
}

export interface Point {
  x: number
  y: number
  pressure?: number
}