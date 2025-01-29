import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import React from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { MarketBadges } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketBadges'
import { MarketWarnings } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketWarnings'
import { TokenPair } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/TokenPair'

const { Spacing } = SizesAndSpaces

export const MarketTitleCell = ({ row, table }: CellContext<LlamaMarket, LlamaMarket['assets']>) => {
  const { blockchainId, assets, type } = row.original
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center">
      <TokenPair blockchainId={blockchainId} assets={assets} />
      <Stack direction="column" gap={Spacing.xs}>
        <MarketBadges blockchainId={blockchainId} type={type} />
        <Typography variant="tableCellL">
          {assets.borrowed.symbol} - {assets.collateral.symbol}
        </Typography>
        <MarketWarnings />
      </Stack>
    </Stack>
  )
}
