import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { InvertTheme } from './ThemeProvider'

const { Spacing } = SizesAndSpaces

// note: use this in the Tooltip component to remove default (inverted color) padding
export const OmitTooltipPadding = { tooltip: { sx: { '&': { padding: 0 } } } }

export const TooltipContent = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  // cancel any theme inversion as it's often applied on hover
  <InvertTheme inverted={false}>
    <Box
      sx={{ padding: Spacing.md, backgroundColor: (t) => t.design.Layer[3].Fill }}
      onClick={(e) => e.stopPropagation()} // prevent changing pages when clicking on the tooltip
    >
      <Typography variant="bodyMBold" color="textPrimary">
        {title}
      </Typography>
      {children}
    </Box>
  </InvertTheme>
)
