import { Dispatch, ReactNode, SetStateAction } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaMarketColumnId } from '../columns'
import { NewMarketListFilterDrawer } from '../drawers/NewMarketListFilterDrawer'

type Props = {
  filterExpanded: boolean
  setFilterExpanded: Dispatch<SetStateAction<boolean>>
  hiddenCount: number
  resetFilters: () => void
  children?: ReactNode
  hasFavorites?: boolean
  data: LlamaMarket[]
  userPositionsTab?: MarketRateType
} & FilterProps<LlamaMarketColumnId>

export const NewFilterChip = ({
  filterExpanded,
  setFilterExpanded,
  hiddenCount,
  resetFilters,
  hasFavorites,
  data,
  userPositionsTab,
  ...filterProps
}: Props) => {
  const isMobile = useIsMobile()
  return isMobile ? (
    <NewMarketListFilterDrawer
      hasFavorites={hasFavorites}
      data={data}
      hiddenCount={hiddenCount}
      resetFilters={resetFilters}
      userPositionsTab={userPositionsTab}
      {...filterProps}
    />
  ) : (
    <GridChip
      label={t`Filters`}
      selected={filterExpanded}
      icon={<FilterIcon />}
      toggle={() => setFilterExpanded((prev) => !prev)}
      data-testid="btn-expand-filters"
    />
  )
}
