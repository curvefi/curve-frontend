import type { LlamaMarketKey, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketTypeFilterChips } from './MarketTypeFilterChips'

export const UserPositionFilterChips = ({
  tab,
  userHasPositions,
  onSearch,
  searchText,
  testId,
  ...filterProps
}: FilterProps<LlamaMarketKey> & {
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  tab: MarketRateType
  searchText: string
  onSearch: (search: string) => void
  testId: string
}) => {
  const isMobile = useIsMobile()
  const showChips = userHasPositions?.Lend[tab] && userHasPositions?.Mint[tab]
  return (
    <Grid container size={12} columnSpacing={1}>
      {showChips && (
        <Grid size={isMobile ? 12 : 6}>
          <MarketTypeFilterChips {...filterProps} />
        </Grid>
      )}
    </Grid>
  )
}
