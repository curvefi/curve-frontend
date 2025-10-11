import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useMarketTypeFilter } from '../hooks/useMarketTypeFilter'

const { Spacing } = SizesAndSpaces

export const MarketTypeFilterChips = (props: FilterProps<LlamaMarketKey>) => {
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  return (
    <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
      <GridChip
        label={t`Mint Markets`}
        selected={marketTypes.Mint}
        toggle={toggleMarkets.Mint}
        data-testid="chip-mint"
      />
      <GridChip
        label={t`Lend Markets`}
        selected={marketTypes.Lend}
        toggle={toggleMarkets.Lend}
        data-testid="chip-lend"
      />
    </Grid>
  )
}
