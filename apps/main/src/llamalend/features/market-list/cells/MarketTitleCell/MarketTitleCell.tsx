import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { CellContext } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketTitle } from '@ui-kit/widgets/MarketTitle'
import { MarketBadges } from './MarketBadges'
import { UserPositionIndicator } from './UserPositionIndicator'

const { Spacing, Height } = SizesAndSpaces

export const MarketTitleCell = ({ row: { original: market } }: CellContext<LlamaMarket, LlamaMarket['assets']>) => {
  const isMobile = useIsMobile()
  const { collateral, borrowed } = market.assets
  return (
    <Stack direction="row" gap={Spacing.sm} alignItems="center" sx={{ height: Height.row }}>
      {market.userHasPositions && <UserPositionIndicator market={market} />}
      <TokenPair chain={market.chain} assets={{ primary: collateral, secondary: borrowed }} />
      <Stack direction="column" justifyContent="center" gap={Spacing.xxs}>
        <MarketTitle
          title={[collateral.symbol, borrowed.symbol].join(' • ')}
          address={market.address}
          url={market.url}
        />
        <MarketBadges market={market} isMobile={isMobile} />
      </Stack>
    </Stack>
  )
}
