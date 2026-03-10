import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PoolAlertMessage = ({ children }: { children: ReactNode }) => (
  <Stack
    alignItems="flex-start"
    spacing={Spacing.sm}
    sx={{
      '& a': {
        wordBreak: 'break-word',
      },
    }}
  >
    {children}
  </Stack>
)
