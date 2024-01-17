import { CSSProperties } from 'react'

export type ValueOf<T> = T[keyof T]
export type Variant = 'primary' | 'secondary'

export type BoxProps = {
  className?: string
  fillHeight?: boolean
  fillWidth?: boolean
  padding?: boolean | string
  margin?: string
  maxWidth?: string
  shadowed?: boolean
  variant?: Variant
  noWrap?: boolean

  grid?: boolean
  gridArea?: string
  gridAutoColumns?: string
  gridAutoRows?: string
  gridAutoFlow?: ValueOf<Pick<CSSProperties, 'gridAutoFlow'>>
  gridGap?: number | string
  gridColumnGap?: number | string
  gridRowGap?: number | string
  gridTemplateColumns?: string
  gridTemplateRows?: string

  flex?: boolean
  flexColumn?: boolean
  flexDirection?: ValueOf<Pick<CSSProperties, 'flexDirection'>>
  flexAlignItems?: ValueOf<Pick<CSSProperties, 'alignItems'>>
  flexJustifyContent?: ValueOf<Pick<CSSProperties, 'justifyContent'>>
  flexCenter?: boolean
  flexWrap?: ValueOf<Pick<CSSProperties, 'justifyContent'>>
}
