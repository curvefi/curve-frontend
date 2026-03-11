import { type ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import { PoolListFilterChips, PoolListFilterChipsProps } from '../components/PoolListFilterChips'
import { PoolListFilterDrawer } from '../drawers/PoolListFilterDrawer'
import { PoolSortDrawer } from '../drawers/PoolSortDrawer'

const { Spacing } = SizesAndSpaces

export const PoolListChips = ({
  hiddenCount,
  resetFilters,
  onSortingChange,
  sortField,
  searchText,
  onSearch,
  ...filterProps
}: {
  hiddenCount: number
  resetFilters: () => void
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
              hiddenCount={hiddenCount}
              resetFilters={resetFilters}
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
      {!isMobile && (
        <HiddenCountResetButton
          hiddenCount={hiddenCount}
          resetFilters={resetFilters}
          filterTooltip={`${t`You have active filters.`} (${t`small markets are hidden by default due to low TVL.`})`}
        />
      )}
    </Grid>
  )
}
