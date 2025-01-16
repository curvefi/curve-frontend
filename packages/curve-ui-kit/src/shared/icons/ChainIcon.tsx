import { getBlockchainIconUrl } from 'ui'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { styled } from '@mui/material/styles'
import Image from 'next/image'

const { IconSize } = SizesAndSpaces

const Icon = styled(Image)({})

export const ChainIcon = ({ blockchainId, size }: { blockchainId: string; size: keyof typeof IconSize }) => {
  // width and height are required, but overridden by responsive design tokens
  const defaultSize = parseFloat(IconSize[size].mobile) * 16 // convert rem to px
  return (
    <Icon
      data-testid={`chain-icon-${blockchainId}`}
      alt={blockchainId}
      // onError={(evt) => (evt.target as HTMLImageElement).src = src}
      src={getBlockchainIconUrl(blockchainId)}
      loading="lazy"
      width={defaultSize}
      height={defaultSize}
      sx={{ width: IconSize[size], height: IconSize[size] }}
    />
  )
}
