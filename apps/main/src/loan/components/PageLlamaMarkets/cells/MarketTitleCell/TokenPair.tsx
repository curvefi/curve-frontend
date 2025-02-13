import { AssetDetails, LlamaMarket } from '@/loan/entities/llama-markets'
import { getImageBaseUrl } from '@ui/utils'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import TokenIcon from '@/loan/components/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'

type TokenPairProps = Pick<LlamaMarket, 'assets' | 'chain'>

const { IconSize } = SizesAndSpaces

const TooltipBox = ({ title, children, sx }: { title: string; children: ReactNode; sx: SxProps<Theme> }) => (
  <Box sx={{ position: 'absolute', ...sx }}>
    <Tooltip title={title} placement="top">
      <Box>{children}</Box>
    </Tooltip>
  </Box>
)

const TokenBox = ({ coin: { address, chain, symbol }, sx }: { coin: AssetDetails; sx: SxProps<Theme> }) => (
  <TooltipBox title={symbol} sx={sx}>
    <TokenIcon imageBaseUrl={getImageBaseUrl(chain)} address={address} token={symbol} />
  </TooltipBox>
)

export const TokenPair = ({ chain, assets: { borrowed, collateral } }: TokenPairProps) => (
  <Box sx={{ position: 'relative', width: IconSize.xxl, height: IconSize.xxl }}>
    <TokenBox coin={borrowed} sx={{ top: '30%', left: '30%' }} />
    <TokenBox coin={collateral} sx={{ bottom: '30%', right: '30%' }} />
    <TooltipBox title={chain} sx={{ top: '0%', left: '0%' }}>
      <ChainIcon size="xs" blockchainId={chain} />
    </TooltipBox>
  </Box>
)
