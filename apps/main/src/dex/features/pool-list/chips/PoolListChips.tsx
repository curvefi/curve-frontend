import { type ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import { PoolListFilterChips, PoolListFilterChipsProps } from '../components/PoolListFilterChips'
import { PoolListFilterDrawer } from '../drawers/PoolListFilterDrawer'
import { PoolSortDrawer } from '../drawers/PoolSortDrawer'

const { Spacing } = SizesAndSpaces

export const PoolListChips = ({
  hiddenCount,
  searchText,
  resetFilters,
  onSortingChange,
  onSearch,
  sortField,
  sortOptions,
  showHiddenCountReset = true,
  ...filterProps
}: {
  hiddenCount: number
  resetFilters: () => void
  children?: ReactNode
  onSortingChange: OnChangeFn<SortingState>
  sortField: PoolColumnId
  searchText: string
  onSearch: (value: string) => void
  sortOptions?: readonly { id: PoolColumnId; label: string }[]
  showHiddenCountReset?: boolean
} & PoolListFilterChipsProps) => {
  const isMobile = useIsMobile()
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            <PoolSortDrawer onSortingChange={onSortingChange} sortField={sortField} options={sortOptions} />
          </Grid>
          <Grid size={6}>
            <PoolListFilterDrawer
              hiddenCount={hiddenCount}
              resetFilters={resetFilters}
              searchText={searchText}
              onSearch={onSearch}
              showHiddenCountReset={showHiddenCountReset}
              {...filterProps}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          columnSpacing={Spacing.xs}
          size={{ mobile: 12, tablet: 'auto' }}
          sx={{ justifyContent: 'flex-end' }}
        >
          <PoolListFilterChips {...filterProps} />
        </Grid>
      )}
      {!isMobile && showHiddenCountReset && (
        <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />
      )}
    </Grid>
  )
}
