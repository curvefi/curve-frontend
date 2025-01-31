import { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import React from 'react'
import { CellContext } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import Typography from '@mui/material/Typography'
import { MarketBadges } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketBadges'
import { MarketWarnings } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketWarnings'
import { TokenPair } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/TokenPair'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { t } from '@lingui/macro'
import { CopyIconButton } from '@ui-kit/shared/ui/CopyIconButton'
import { MarketLink } from '@/loan/components/PageLlamaMarkets/cells/MarketTitleCell/MarketLink'

const { Spacing } = SizesAndSpaces

const showIconOnHover = {
  '& .MuiIconButton-root': { opacity: 0, transition: `opacity ${TransitionFunction}` },
  [`&:hover .MuiIconButton-root`]: { opacity: 1 },
}

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarket, LlamaMarket['assets']>) => (
  <Stack direction="row" gap={Spacing.sm} alignItems="center">
    <TokenPair blockchainId={market.blockchainId} assets={market.assets} />
    <Stack direction="column" gap={Spacing.xs}>
      <MarketBadges market={market} />
      <Typography component={Stack} variant="tableCellL" sx={showIconOnHover} direction="row" gap={2}>
        <MarketLink market={market}>
          {market.assets.borrowed.symbol} - {market.assets.collateral.symbol}
        </MarketLink>
        <CopyIconButton
          label={t`Copy market address`}
          copyText={market.address}
          confirmationText={t`Market address copied`}
        />
      </Typography>
      <MarketWarnings market={market} />
    </Stack>
  </Stack>
)
