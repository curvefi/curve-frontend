import type { LlamaMarketKey, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketTypeFilterChips } from './MarketTypeFilterChips'

export const UserPositionFilterChips = ({
  tab,
  userPositions,
  onSearch,
  searchText,
  ...filterProps
}: FilterProps<LlamaMarketKey> & {
  userPositions: LlamaMarketsResult['userPositions'] | undefined
  tab: MarketRateType
  searchText: string
  onSearch: (search: string) => void
}) => {
  const isMobile = useIsMobile()
  const showChips = userPositions?.Lend[tab] && userPositions?.Mint[tab]
  return (
    <Grid container justifyContent="space-between" size={12}>
      {!isMobile && (
        <Grid size={showChips ? 6 : 12}>
          <TableSearchField value={searchText} onChange={onSearch} />
        </Grid>
      )}
      {showChips && (
        <Grid size={isMobile ? 12 : 6}>
          <MarketTypeFilterChips {...filterProps} />
        </Grid>
      )}
    </Grid>
  )
}
