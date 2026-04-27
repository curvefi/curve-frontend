import { ReactNode } from 'react'
import { CSSObject } from '@mui/material'
import Box from '@mui/material/Box'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

type SecondaryIconBadgeProps = {
  children: ReactNode
  tooltipTitle: ReactNode
  // top-left, top-right, bottom-left, bottom-right relative to the main TokenIcon
  position?: 'tl' | 'tr' | 'bl' | 'br'
}

const OFFSET = '-16.66%'

/** Maps each badge position to its absolute offset relative to the main TokenIcon. */
const ABSOLUTE_POSITIONS: Record<NonNullable<SecondaryIconBadgeProps['position']>, CSSObject> = {
  tl: { top: OFFSET, left: OFFSET },
  tr: { top: OFFSET, right: OFFSET },
  bl: { bottom: OFFSET, left: OFFSET },
  br: { bottom: OFFSET, right: OFFSET },
}

/** Positions a badge in one corner of a TokenIcon and shows its tooltip on hover. */
export const TokenBadge = ({ children, tooltipTitle, position = 'tl' }: SecondaryIconBadgeProps) => (
  <Tooltip title={tooltipTitle} placement="top" slotProps={{ popper: { sx: { textTransform: 'capitalize' } } }}>
    <Box sx={{ position: 'absolute', ...ABSOLUTE_POSITIONS[position] }}>{children}</Box>
  </Tooltip>
)
