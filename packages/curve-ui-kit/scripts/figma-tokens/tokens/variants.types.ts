export type ScreenType = 'desktop' | 'mobile'

export type TextCase = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type TextDecoration = 'none' | 'underline' | 'line-through'
export type FontStyle = 'normal' | 'italic' | 'oblique'
export type FontStretch = 'normal' | 'condensed' | 'expanded'

export type StrokeAlign = 'center' | 'inside' | 'outside'
export type StrokeCap = 'none' | 'round' | 'square' | 'arrow_lines' | 'arrow_equilateral' | 'mixed'
export type StrokeJoin = 'miter' | 'bevel' | 'round'

export type GridPattern = 'rows' | 'columns' | 'grid'
export type GridAlignment = 'stretch' | 'center' | 'min' | 'max'

export type EffectType = 'dropShadow' | 'innerShadow' | 'layerBlur' | 'backgroundBlur'

export type FigmaTypographyToken = {
  description?: string
  fontSize: number
  textDecoration: TextDecoration
  fontFamily: string
  fontWeight: number
  fontStyle: FontStyle
  fontStretch: FontStretch
  letterSpacing: number
  lineHeight: number
  paragraphIndent: number
  paragraphSpacing: number
  textCase: TextCase
}
