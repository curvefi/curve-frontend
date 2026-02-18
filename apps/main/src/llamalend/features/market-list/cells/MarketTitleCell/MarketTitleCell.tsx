import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketTitle } from '@ui-kit/widgets/MarketTitle'
import { MarketBadges } from './MarketBadges'
import { UserMarketPositionIndicator } from './UserMarketPositionIndicator'

const { Spacing, Height } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarket, LlamaMarket['assets']>) => {
  const isMobile = useIsMobile()
  const { collateral, borrowed } = market.assets
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center" sx={{ height: Height.row }}>
      {market.userHasPositions && <UserMarketPositionIndicator market={market} sx={{ alignSelf: 'stretch' }} />}
      <TokenPair chain={market.chain} assets={{ primary: collateral, secondary: borrowed }} hideChainIcon />
      <Stack direction="column" justifyContent="center" gap={Spacing.xxs}>
        <MarketTitle
          title={[collateral.symbol, borrowed.symbol].join(' • ')}
          address={market.controllerAddress}
          url={market.url}
        />
        <MarketBadges market={market} isMobile={isMobile} />
      </Stack>
    </Stack>
  )
}
