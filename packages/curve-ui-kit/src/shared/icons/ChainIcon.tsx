import { styled } from '@mui/material/styles'
import { getBlockchainIconUrl } from '@ui/utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const { IconSize } = SizesAndSpaces

const Icon = styled('img')({})

export type ChainIconProps = {
  blockchainId: string
  size: keyof typeof IconSize
  border?: boolean
  sx?: SxProps
}

export const ChainIcon = ({ blockchainId, border, size, sx }: ChainIconProps) => {
  // width and height are required, but overridden by responsive design tokens
  const defaultSize = parseFloat(IconSize[size].mobile) * 16 // convert rem to px
  return (
    <Icon
      data-testid={`chain-icon-${blockchainId}`}
      alt={blockchainId}
      src={getBlockchainIconUrl(blockchainId)}
      loading="lazy"
      width={defaultSize}
      height={defaultSize}
      sx={applySxProps(
        {
          width: IconSize[size],
          height: IconSize[size],
          ...(border && {
            border: (t) => `1px solid ${t.design.Badges.Border.Highlight}`,
            padding: '1px',
            borderRadius: '100%',
            backgroundColor: (t) => t.design.Badges.Fill.Highlight,
          }),
        },
        sx,
      )}
    />
  )
}
