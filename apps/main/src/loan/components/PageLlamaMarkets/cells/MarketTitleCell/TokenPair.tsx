import { LlamaMarket } from '@/loan/entities/llama-markets'
import { getImageBaseUrl } from '@ui/utils'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import TokenIcon from '@/loan/components/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { AssetDetails } from '@/loan/entities/lending-vaults'
import { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'

type TokenPairProps = Pick<LlamaMarket, 'assets' | 'blockchainId'>

const { IconSize } = SizesAndSpaces

const TooltipBox = ({ title, children, sx }: { title: string; children: ReactNode; sx: SxProps<Theme> }) => (
  <Box sx={{ position: 'absolute', ...sx }}>
    <Tooltip title={title} placement="top">
      <Box>{children}</Box>
    </Tooltip>
  </Box>
)

const TokenBox = ({ coin: { address, blockchainId, symbol }, sx }: { coin: AssetDetails; sx: SxProps<Theme> }) => (
  <TooltipBox title={symbol} sx={sx}>
    <TokenIcon imageBaseUrl={getImageBaseUrl(blockchainId)} address={address} token={symbol} />
  </TooltipBox>
)

export const TokenPair = ({ blockchainId, assets: { borrowed, collateral } }: TokenPairProps) => (
  <Box sx={{ position: 'relative', width: IconSize.xxl, height: IconSize.xxl }}>
    <TokenBox coin={borrowed} sx={{ top: '30%', left: '30%' }} />
    <TokenBox coin={collateral} sx={{ bottom: '30%', right: '30%' }} />
    <TooltipBox title={blockchainId} sx={{ top: '0%', right: '0%' }}>
      <ChainIcon size="xs" blockchainId={blockchainId} />
    </TooltipBox>
  </Box>
)
