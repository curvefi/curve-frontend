import Box from '@mui/material/Box'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenChainIcon } from './TokenChainIcon'
import { TokenIcon } from './TokenIcon'

const { IconSize } = SizesAndSpaces

type Asset = {
  symbol: string
  address: string
}

type Props = {
  chain: string
  assets: {
    primary: Asset
    secondary: Asset
  }
  hideChainIcon?: boolean
}

export const TokenPair = ({ chain, assets: { primary, secondary }, hideChainIcon = false }: Props) => (
  <Box sx={{ position: 'relative', width: IconSize.xl, height: IconSize.xl }}>
    <TokenIcon
      blockchainId={chain}
      address={secondary.address}
      tooltip={secondary.symbol}
      sx={{ position: 'absolute', top: '33%', left: '33%' }}
    />

    <TokenIcon
      blockchainId={chain}
      address={primary.address}
      tooltip={primary.symbol}
      sx={{ position: 'absolute', bottom: '33%', right: '33%' }}
    />

    {!hideChainIcon && <TokenChainIcon chain={chain} />}
  </Box>
)
