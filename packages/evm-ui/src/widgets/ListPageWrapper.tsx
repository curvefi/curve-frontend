import type { ReactNode } from 'react'
import { useIsTiny } from '@evm-ui/hooks/useBreakpoints'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'

const { Spacing, MaxWidth, MinHeight } = SizesAndSpaces

export const ListPageWrapper = ({ footer, children }: { children: ReactNode; footer?: ReactNode }) => (
  <Box sx={{ marginBlockEnd: Spacing.xxl, ...(!useIsTiny() && { marginInline: Spacing.md }) }}>
    <Stack
      sx={{
        gap: Spacing.xxl,
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
        minHeight: MinHeight.pageContent,
      }}
    >
      {children}
    </Stack>

    {footer}
  </Box>
)
