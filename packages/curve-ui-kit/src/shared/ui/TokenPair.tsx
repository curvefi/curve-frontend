import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon } from './TokenIcon'
import { ChainIcon } from '../icons/ChainIcon'

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
}

export const TokenPair = ({ chain, assets: { borrowed, collateral } }: Props) => (
  <Box sx={{ position: 'relative', width: IconSize.xxl, height: IconSize.xxl }}>
    <TokenIcon
      blockchainId={chain}
      address={borrowed.address}
      tooltip={borrowed.symbol}
      sx={{ position: 'absolute', top: '30%', left: '30%' }}
    />

    <TokenIcon
      blockchainId={chain}
      address={collateral.address}
      tooltip={collateral.symbol}
      sx={{ position: 'absolute', bottom: '30%', right: '30%' }}
    />

    <Tooltip title={chain} placement="top">
      <Box sx={{ position: 'absolute', top: '0%', left: '0%' }}>
        <ChainIcon size="xs" blockchainId={chain} />
      </Box>
    </Tooltip>
  </Box>
)
