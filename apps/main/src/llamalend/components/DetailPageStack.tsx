import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MinWidth } = SizesAndSpaces

/**
 * A stack that separates the detail page into two main sections:
 * 1. action form (loan creation, loan management, vault view) (left side on larger screens)
 * 2. market and user position details (right side on larger screens)
 */
export const DetailPageStack = ({ children }: { children: ReactNode }) => (
  <Stack
    data-testid="detail-page-stack"
    sx={(t) => ({
      marginInline: Spacing.md,
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      gap: Spacing.xl,
      flexDirection: 'column',
      [t.breakpoints.up(MinWidth.twoCardLayout)]: { flexDirection: 'row' },
    })}
  >
    {children}
  </Stack>
)
