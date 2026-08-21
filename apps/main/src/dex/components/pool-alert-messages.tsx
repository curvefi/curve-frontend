import type { ReactNode } from 'react'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

export const PoolAlertMessage = ({ children }: { children: ReactNode }) => (
  <Stack
    spacing={Spacing.sm}
    sx={{
      alignItems: 'flex-start',

      '& a': {
        wordBreak: 'break-word',
      },
    }}
  >
    {children}
  </Stack>
)
