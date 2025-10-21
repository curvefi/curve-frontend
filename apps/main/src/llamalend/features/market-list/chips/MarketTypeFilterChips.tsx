import type { LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { useMarketTypeFilter } from '../hooks/useMarketTypeFilter'

export const MarketTypeFilterChips = (props: FilterProps<LlamaMarketKey>) => {
  const [marketTypes, toggleMarkets] = useMarketTypeFilter(props)
  const isMobile = useIsMobile()
  return (
    <>
      <GridChip
        label={t`Mint Markets`}
        onDelete={toggleMarkets.Mint}
        selected={marketTypes.Mint}
        toggle={toggleMarkets.Mint}
        data-testid="chip-mint"
        selectableChipSize={isMobile ? 'large' : 'small'}
      />
      <GridChip
        label={t`Lend Markets`}
        onDelete={toggleMarkets.Lend}
        selected={marketTypes.Lend}
        toggle={toggleMarkets.Lend}
        data-testid="chip-lend"
        selectableChipSize={isMobile ? 'large' : 'small'}
      />
    </>
  )
}
