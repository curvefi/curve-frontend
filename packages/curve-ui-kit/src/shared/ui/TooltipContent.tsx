import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { InvertTheme } from './ThemeProvider'

const { Spacing } = SizesAndSpaces

export const TooltipContent = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  // cancel any theme inversion as it's often applied on hover
  <InvertTheme inverted={false}>
    <Card sx={{ padding: Spacing.md, backgroundColor: (t) => t.design.Layer[3].Fill }}>
      <Typography variant="bodyMBold">{title}</Typography>
      {children}
    </Card>
  </InvertTheme>
)
