import { styled } from '@mui/material/styles'
import { CURVE_ASSETS_URL } from '@ui/utils'
import { SizesAndSpaces } from '../../themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const RewardsImg = styled('img')({ border: '1px solid transparent', borderRadius: '50%' })

type IconSize = keyof typeof IconSize

export function RewardIcon({ imageId, size = 'xs' }: { imageId: string; size?: IconSize }) {
  const defaultSize = parseFloat(IconSize[size].mobile) * 16 // convert rem to px
  return (
    <RewardsImg
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
