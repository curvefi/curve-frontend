import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import MuiTooltip, { TooltipProps as MuiTooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

type TooltipProps = MuiTooltipProps & {
  body?: ReactNode
}

const { Spacing } = SizesAndSpaces

/**
 * This component is used to wrap the content of a tooltip to cancel any theme inversions during hover.
 */
export const TooltipContent = ({ title, children }: { title: ReactNode; children?: ReactNode }) => (
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

/**
 * Adds a tooltip to the children with a title and content, making sure the content is not inverted on hover.
 */
export const Tooltip = ({ title, body, children, ...props }: TooltipProps) => (
  <MuiTooltip
    title={<TooltipContent title={title}>{body}</TooltipContent>}
    slotProps={{ tooltip: { sx: { '&': { padding: 0 } } } }} // remove padding with inverted color
    {...props}
  >
    {children}
  </MuiTooltip>
)
