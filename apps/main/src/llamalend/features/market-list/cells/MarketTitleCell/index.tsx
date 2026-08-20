import type { LlamaMarketRow } from '@/llamalend/queries/market-list/llama-market-stats'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { TokenIcons } from '@evm-ui/shared/ui/TokenIcons'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MarketTitle } from '@evm-ui/widgets/MarketTitle'
import { MarketBadges } from './MarketBadges'
import { UserMarketPositionIndicator } from './UserMarketPositionIndicator'

const { Spacing, Height } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarketRow, string>) => {
  const isMobile = useIsMobile()
  const { collateral, borrowed } = market.assets
  return (
    <Stack direction="row" sx={{ height: Height.row }}>
      {market.userHasPositions && <UserMarketPositionIndicator market={market} />}
      <Stack direction="row" sx={{ gap: Spacing.sm, alignItems: 'center' }}>
        <TokenIcons blockchainId={market.chain} tokens={[collateral, borrowed]} />
        <Stack direction="column" sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
          <MarketTitle
            title={[collateral.symbol, borrowed.symbol].join(' • ')}
            address={market.controllerAddress}
            url={market.url}
          />
          <MarketBadges market={market} isMobile={isMobile} />
        </Stack>
      </Stack>
    </Stack>
  )
}
