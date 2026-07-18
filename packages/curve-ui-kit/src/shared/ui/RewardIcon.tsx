import { styled } from '@mui/material/styles'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

const RewardImage = styled('img')({})

export type RewardIconSize = keyof typeof IconSize

export type RewardIconProps = {
  src: string
  alt: string
  size?: RewardIconSize
  sx?: SxProps
}

const getSize = (size: RewardIconSize) => parseFloat(IconSize[size].mobile) * 16

/** Renders an image using the responsive reward-icon sizes. */
export const RewardIcon = ({ src, alt, size = 'xs', sx }: RewardIconProps) => (
  <RewardImage
    alt={alt}
    src={src}
    width={getSize(size)}
    height={getSize(size)}
    sx={applySxProps({ width: IconSize[size], height: IconSize[size] }, sx)}
  />
)
