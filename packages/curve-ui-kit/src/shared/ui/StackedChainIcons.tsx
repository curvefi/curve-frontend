import Stack, { type StackProps } from '@mui/material/Stack'
import { mapRecord } from '@primitives/objects.utils'
import { ChainIcon, type ChainIconProps } from '@ui-kit/shared/icons/ChainIcon'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize, Spacing } = SizesAndSpaces

type StackedChainIconsProps = StackProps & {
  blockchainIds: string[]
  size?: ChainIconProps['size']
  // percentage of the ChainIcon's width to overlap
  overlap?: number
  sx?: SxProps
}

// Builds responsive overlap offsets for each icon size, signed by direction.
const overlapBySize = (direction: 'left' | 'right', overlap: number) => {
  const sign = { left: -1, right: 1 }[direction]
  return mapRecord(IconSize, (_, responsiveSize) =>
    mapRecord(responsiveSize, (_, value) => `calc(${value} * ${overlap} * ${sign})`),
  )
}

export const StackedChainIcons = ({
  blockchainIds,
  size = 'md',
  overlap = 1 / 3,
  sx,
  ...stackProps
}: StackedChainIconsProps) => (
  <Stack
    direction="row"
    alignItems="center"
    flexWrap="wrap"
    rowGap={Spacing.xxs}
    {...stackProps}
    // margin to counter the marginLeft of the ChainIcon at the beginning of each row
    sx={applySxProps({ marginLeft: handleBreakpoints({ marginLeft: overlapBySize('right', overlap)[size] }) }, sx)}
  >
    {blockchainIds.map(blockchainId => (
      <ChainIcon
        key={blockchainId}
        blockchainId={blockchainId}
        size={size}
        border
        // margin to overlap the ChainIcons
        sx={handleBreakpoints({ marginLeft: overlapBySize('left', overlap)[size] })}
      />
    ))}
  </Stack>
)
