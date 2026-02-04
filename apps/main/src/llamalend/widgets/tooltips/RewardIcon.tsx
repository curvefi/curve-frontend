import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { styled } from '@mui/material/styles'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

const RewardsImg = styled('img')``

type IconSize = keyof typeof IconSize

// convert rem to px
const getSize = (size: IconSize) => parseFloat(IconSize[size].mobile) * 16

export const RewardIcon = ({ imageId, size = 'xs', sx }: { imageId: string; size: IconSize; sx?: SxProps }) => (
  <RewardsImg
    alt={imageId}
    src={imageId}
    width={getSize(size)}
    height={getSize(size)}
    sx={applySxProps({ width: IconSize[size], height: IconSize[size] }, sx)}
  />
)
