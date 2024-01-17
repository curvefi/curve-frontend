import type { CSSProperties } from 'styled-components'

type ValueOf<T> = T[keyof T]

export type IsClosePlacement = {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
}

export type TooltipProps = {
  minWidth?: string
  noWrap?: boolean
  placement?: string
  textAlign?: ValueOf<Pick<CSSProperties, 'textAlign'>>
}
