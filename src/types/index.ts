export interface Font {
  name: string
  url: string
  style: string
}

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
  lineColor?: string
  lineOpacity?: number
  lineWidth?: number
  lineSpacing?: number
  marginColor?: string
}
