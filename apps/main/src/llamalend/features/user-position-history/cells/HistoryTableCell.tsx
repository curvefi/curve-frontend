import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { SxProps, Theme } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Sizing, Spacing } = SizesAndSpaces

interface HistoryTableCellProps {
  children: ReactNode
  onClick?: () => void
  sx?: SxProps<Theme>
}

export const HistoryTableCell = ({ children, onClick, sx }: HistoryTableCellProps) => (
  <Stack
    height={Sizing.xl}
    paddingY={Spacing.xxs}
    onClick={onClick}
    sx={onClick ? { cursor: 'pointer', ...sx } : sx}
    justifyContent="center"
  >
    {children}
  </Stack>
)
