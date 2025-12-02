import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { LinkIcon } from '@ui-kit/shared/icons/LinkIcon'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces
const borderWidth = '0.25rem' // 4px

export const InputDivider = ({ children = <LinkIcon /> }: { children?: ReactNode }) => (
  // wrap with a relative box to position the absolute box inside and only take the spacing height
  <Box position="relative" sx={{ width: '100%', height: Spacing.xs, verticalAlign: 'middle' }}>
    <Box
      position="absolute"
      sx={{
        lineHeight: 0, // make sure the container doesn't add any extra height
        // Calculate top and left to center the icon in the divider line
        top: mapBreakpoints(IconSize.md, (iconSize) => `calc(-${iconSize}/2 - ${borderWidth}/2)`),
        left: mapBreakpoints(IconSize.md, (iconSize) => `calc(50% - ${iconSize}/2 - ${borderWidth}/2)`),
        border: (t) => `${borderWidth} solid ${t.design.Color.Neutral[50]}`,
        backgroundColor: (t) => t.design.Layer[2].Fill,
        stroke: (t) => t.design.Text.TextColors.Primary,
        svg: { fontSize: IconSize.md, width: IconSize.md, height: IconSize.md },
      }}
    >
      {children}
    </Box>
  </Box>
)
