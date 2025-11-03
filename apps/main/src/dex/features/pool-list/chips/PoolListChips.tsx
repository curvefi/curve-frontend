import { type ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { HiddenMarketsResetFilters } from '@ui-kit/shared/ui/DataTable/HiddenMarketsResetFilters'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import { PoolListFilterChips, PoolListFilterChipsProps } from '../components/PoolListFilterChips'
import { PoolListFilterDrawer } from '../drawers/PoolListFilterDrawer'
import { PoolSortDrawer } from '../drawers/PoolSortDrawer'

const { Spacing } = SizesAndSpaces

export const PoolListChips = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  onSortingChange,
  sortField,
  searchText,
  onSearch,
  ...filterProps
}: {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  children?: ReactNode
  onSortingChange: OnChangeFn<SortingState>
  sortField: PoolColumnId
  searchText: string
  onSearch: (value: string) => void
} & PoolListFilterChipsProps) => {
  const isMobile = useIsMobile()
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            <PoolSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
          </Grid>
          <Grid size={6}>
            <PoolListFilterDrawer
              hiddenMarketCount={hiddenMarketCount}
              resetFilters={resetFilters}
              hasFilters={hasFilters}
              searchText={searchText}
              onSearch={onSearch}
              {...filterProps}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container columnSpacing={Spacing.xs} justifyContent="flex-end" size={{ mobile: 12, tablet: 'auto' }}>
          <PoolListFilterChips {...filterProps} />
        </Grid>
      )}
      {hiddenMarketCount != null && !isMobile && (
        <HiddenMarketsResetFilters
          hiddenMarketCount={hiddenMarketCount}
          resetFilters={resetFilters}
          hasFilters={hasFilters}
        />
      )}
    </Grid>
  )
}
