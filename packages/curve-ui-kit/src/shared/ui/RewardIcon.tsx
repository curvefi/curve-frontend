import uniq from 'lodash/uniq'
import NextImage from 'next/image'
import Box, { type BoxProps } from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { CURVE_ASSETS_URL } from '@ui/utils'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const Img = styled(NextImage)({ border: '1px solid transparent', borderRadius: '50%' })

type IconSize = keyof typeof IconSize

export function RewardIcon({ imageId, size = 'xs' }: { imageId: string; size?: IconSize }) {
  const defaultSize = parseFloat(IconSize[size].mobile) * 16 // convert rem to px
  return (
    <Img
      alt={imageId}
      src={`${CURVE_ASSETS_URL}/platforms/${imageId}`}
      width={defaultSize}
      height={defaultSize}
      sx={{
        width: IconSize[size],
        height: IconSize[size],
      }}
    />
  )
}

export const RewardIcons = ({
  size,
  rewards,
  ...props
}: { size?: IconSize; rewards: { platformImageId: string }[] } & BoxProps) => (
  <Box component="span" {...props}>
    {uniq(rewards.map((r) => r.platformImageId)).map((img) => (
      <RewardIcon size={size} key={img} imageId={img} />
    ))}
  </Box>
)
