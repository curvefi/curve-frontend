import Stack, { type StackProps } from '@mui/material/Stack'
import { ChainIcon, type ChainIconProps } from '@ui-kit/shared/icons/ChainIcon'
import { handleBreakpoints, type Responsive } from '@ui-kit/themes/basic-theme'
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

const overlapBySize = (direction: 'left' | 'right', overlap: number) => {
  const sign = direction === 'left' ? -1 : 1
  return Object.fromEntries(
    Object.entries(IconSize).map(([size, responsiveSize]) => [
      size,
      {
        mobile: `calc(${responsiveSize.mobile} * ${overlap} * ${sign})`,
        tablet: `calc(${responsiveSize.tablet} * ${overlap} * ${sign})`,
        desktop: `calc(${responsiveSize.desktop} * ${overlap} * ${sign})`,
      } satisfies Responsive<string>,
    ]),
  ) as Record<ChainIconProps['size'], Responsive<string>>
}

export const StackedChainIcons = ({
  blockchainIds,
  size = 'sm',
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
    // this margin is needed to counter the marginLeft of the ChaiIcon at the beginning of each row
    sx={applySxProps({ marginLeft: handleBreakpoints({ marginLeft: overlapBySize('right', overlap)[size] }) }, sx)}
  >
    {blockchainIds.map((blockchainId) => (
      <ChainIcon
        key={blockchainId}
        blockchainId={blockchainId}
        size={size}
        border
        sx={{
          // this margin is needed to overlap the ChainIcons
          ...handleBreakpoints({ marginLeft: overlapBySize('left', overlap)[size] }),
        }}
      />
    ))}
  </Stack>
)
