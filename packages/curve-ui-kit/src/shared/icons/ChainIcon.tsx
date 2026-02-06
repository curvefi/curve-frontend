import { styled } from '@mui/material/styles'
import { getBlockchainIconUrl } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const Icon = styled('img')({})

export type ChainIconProps = {
  blockchainId: string
  size: keyof typeof IconSize
}

export const ChainIcon = ({ blockchainId, size }: ChainIconProps) => {
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
