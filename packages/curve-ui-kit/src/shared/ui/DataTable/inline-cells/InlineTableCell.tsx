import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'

const { Sizing, Spacing } = SizesAndSpaces

interface InlineTableCellProps {
  children: ReactNode
  onClick?: () => void
  sx?: SxProps<Theme>
  className?: string
}

/**
 * Base cell wrapper component for inline tables.
 * Provides consistent height, padding, and optional click handling.
 */
export const InlineTableCell = ({ children, onClick, sx, className }: InlineTableCellProps) => (
  <Stack
    onClick={onClick}
    className={className}
    sx={applySxProps(
      { height: Sizing.xl, paddingY: Spacing.xxs, justifyContent: 'center' },
      onClick && { cursor: 'pointer' },
      sx,
    )}
  >
    {children}
  </Stack>
)
