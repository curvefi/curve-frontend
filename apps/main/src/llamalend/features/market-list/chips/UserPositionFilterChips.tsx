import type { LlamaMarketKey, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { MarketTypeFilterChips } from './MarketTypeFilterChips'

const { Spacing } = SizesAndSpaces

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

  return (
    <Grid container size={12} spacing={Spacing.sm}>
      <MarketTypeFilterChips {...filterProps} />
    </Grid>
  )
}
