import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { mapRecord } from '@primitives/objects.utils'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize, Spacing } = SizesAndSpaces

const DEFAULT_ICON_STACK_OVERLAP = 1 / 3

// Builds responsive overlap offsets for each icon size, signed by direction.
const overlapBySize = (direction: 'left' | 'right', overlap: number) => {
  const sign = { left: -1, right: 1 }[direction]
  return mapRecord(IconSize, (_, responsiveSize) =>
    mapRecord(responsiveSize, (_, value) => `calc(${value} * ${overlap} * ${sign})`),
  )
}

export const IconStack = ({
  children,
  iconSize = 'md',
  overlap = DEFAULT_ICON_STACK_OVERLAP,
}: {
  children: ReactNode
  /** The intended size of icons that will be used in the children for correct margin calculations */
  iconSize?: keyof typeof IconSize
  /** Percentage of the icon width to overlap */
  overlap?: number
}) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'center',
      flexWrap: 'wrap',
      rowGap: Spacing.xxs,
      ...handleBreakpoints({ marginLeft: overlapBySize('right', overlap)[iconSize] }),
      '& > *': handleBreakpoints({ marginLeft: overlapBySize('left', overlap)[iconSize] }),
    }}
  >
    {children}
  </Stack>
)
