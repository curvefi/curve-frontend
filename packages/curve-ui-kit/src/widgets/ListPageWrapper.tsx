import type { ReactNode } from 'react'
import { Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { useIsTiny } from '@ui-kit/hooks/useBreakpoints'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, MaxWidth, MinHeight } = SizesAndSpaces

export const ListPageWrapper = ({ footer, children }: { children: ReactNode; footer?: ReactNode }) => (
  <Box sx={{ marginBlockEnd: Spacing.xxl, ...(!useIsTiny() && { marginInline: Spacing.md }) }}>
    <Stack
      sx={{
        marginBlockStart: Spacing.xl,
        marginBlockEnd: Spacing.xxl,
        maxWidth: MaxWidth.table,
        minHeight: MinHeight.pageContent,
      }}
      gap={Spacing.xxl}
    >
      {children}
    </Stack>

    {footer}
  </Box>
)
