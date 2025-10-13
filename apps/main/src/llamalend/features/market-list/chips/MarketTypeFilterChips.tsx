import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import { t } from '@ui-kit/lib/i18n'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useMarketTypeFilter } from '../hooks/useMarketTypeFilter'
import { GridChip } from './GridChip'

const { Spacing } = SizesAndSpaces

export const MarketTypeFilterChips = (props: FilterProps<LlamaMarketKey>) => {
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  return (
    <>
      <GridChip
        label={t`Mint Markets`}
        onDelete={toggleMarkets.Mint}
        selected={marketTypes.Mint}
        toggle={toggleMarkets.Mint}
        data-testid="chip-mint"
      />
      <GridChip
        label={t`Lend Markets`}
        onDelete={toggleMarkets.Lend}
        selected={marketTypes.Lend}
        toggle={toggleMarkets.Lend}
        data-testid="chip-lend"
      />
    </>
  )
}
