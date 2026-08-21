import type { CSSProperties } from 'styled-components'
import type { MuiTooltipProps } from '@ui-kit/shared/ui/Tooltip'

type ValueOf<T> = T[keyof T]

export type TooltipProps = {
  minWidth?: string
  noWrap?: boolean
  clickable?: boolean
  placement?: MuiTooltipProps['placement']
  textAlign?: ValueOf<Pick<CSSProperties, 'textAlign'>>
}
