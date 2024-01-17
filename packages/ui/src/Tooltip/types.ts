import type { CSSProperties } from 'styled-components'
import type { Placement } from '@react-types/overlays'

type ValueOf<T> = T[keyof T]

export type TooltipProps = {
  minWidth?: string
  noWrap?: boolean
  placement?: Placement
  textAlign?: ValueOf<Pick<CSSProperties, 'textAlign'>>
}
