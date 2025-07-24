import Box from '@mui/material/Box'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChainIcon } from '../icons/ChainIcon'
import { TokenIcon } from './TokenIcon'

const { IconSize } = SizesAndSpaces

type Asset = {
  symbol: string
  address: string
}

type Props = {
  chain: string
  assets: {
    borrowed: Asset
    collateral: Asset
  }
  hideChainIcon?: boolean
}

export const TokenPair = ({ chain, assets: { borrowed, collateral }, hideChainIcon = false }: Props) => (
  <Box sx={{ position: 'relative', width: IconSize.xl, height: IconSize.xl }}>
    <TokenIcon
      blockchainId={chain}
      address={borrowed.address}
      tooltip={borrowed.symbol}
      sx={{ position: 'absolute', top: '33%', left: '33%' }}
    />

    <TokenIcon
      blockchainId={chain}
      address={collateral.address}
      tooltip={collateral.symbol}
      sx={{ position: 'absolute', bottom: '33%', right: '33%' }}
    />

    {!hideChainIcon && (
      <Tooltip title={chain} placement="top" slotProps={{ popper: { sx: { textTransform: 'capitalize' } } }}>
        <Box sx={{ position: 'absolute', top: '-16.66%', left: '-16.66%' }}>
          <ChainIcon size="sm" blockchainId={chain} />
        </Box>
      </Tooltip>
    )}
  </Box>
)
