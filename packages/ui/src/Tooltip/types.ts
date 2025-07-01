import type { CSSProperties } from 'styled-components'
import { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'

type ValueOf<T> = T[keyof T]

export type TooltipProps = {
  minWidth?: string
  noWrap?: boolean
  placement?: MuiTooltipProps['placement']
  textAlign?: ValueOf<Pick<CSSProperties, 'textAlign'>>
}
