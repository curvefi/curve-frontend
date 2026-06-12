import type { Key, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { mapRecord } from '@primitives/objects.utils'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize, Spacing } = SizesAndSpaces

export const DEFAULT_OVERLAP = 1 / 3

export type StackedIconSize = keyof typeof IconSize

export type StackedIconsProps<T> = {
  items: readonly T[]
  getKey: (item: T, index: number) => Key
  renderIcon: (item: T, index: number) => ReactNode
  size?: StackedIconSize
  /** Percentage of the icon width to overlap */
  overlap?: number
}

// Builds responsive overlap offsets for each icon size, signed by direction.
const overlapBySize = (direction: 'left' | 'right', overlap: number) => {
  const sign = { left: -1, right: 1 }[direction]
  return mapRecord(IconSize, (_, responsiveSize) =>
    mapRecord(responsiveSize, (_, value) => `calc(${value} * ${overlap} * ${sign})`),
  )
}

export const StackedIcons = <T,>({
  items,
  getKey,
  renderIcon,
  size = 'md',
  overlap = DEFAULT_OVERLAP,
}: StackedIconsProps<T>) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'center',
      flexWrap: 'wrap',
      rowGap: Spacing.xxs,
      ...handleBreakpoints({ marginLeft: overlapBySize('right', overlap)[size] }),
    }}
  >
    {items.map((item, index) => (
      <Box
        key={getKey(item, index)}
        sx={{
          display: 'flex',
          ...handleBreakpoints({ marginLeft: overlapBySize('left', overlap)[size] }),
        }}
      >
        {renderIcon(item, index)}
      </Box>
    ))}
  </Stack>
)
