import type { LlamaMarketKey, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketTypeFilterChips } from './MarketTypeFilterChips'

export const UserPositionFilterChips = ({
  tab,
  userHasPositions,
  onSearch,
  searchText,
  ...filterProps
}: FilterProps<LlamaMarketKey> & {
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  tab: MarketRateType
  searchText: string
  onSearch: (search: string) => void
}) => {
  const isMobile = useIsMobile()
  const showChips = userHasPositions?.Lend[tab] && userHasPositions?.Mint[tab]
  return (
    <Grid container justifyContent="space-between" size={12} columnSpacing={1}>
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
