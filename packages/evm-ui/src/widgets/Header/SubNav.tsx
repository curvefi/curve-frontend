import type { ReactNode } from 'react'
import { DEFAULT_BAR_SIZE } from '@evm-ui/themes/components'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { getHeaderBorder } from './utils'

const { Spacing } = SizesAndSpaces

export const SubNav = ({ testId, children }: { testId: string; children: ReactNode }) => (
  <Toolbar
    sx={{
      backgroundColor: t => t.design.Layer[1].Fill,
      justifyContent: 'space-around',
      borderTop: getHeaderBorder,
      boxSizing: 'border-box',
      height: DEFAULT_BAR_SIZE,
    }}
    data-testid={testId}
  >
    <Container sx={{ alignItems: 'baseline', paddingInline: Spacing.md }}>{children}</Container>
  </Toolbar>
)
