import { type ReactNode } from 'react'
import { HiddenCountResetButton } from '@evm-ui/shared/ui/DataTable/HiddenCountResetButton'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { LegacyPoolsChips, type LegacyPoolsChipsProps } from '../chips/LegacyPoolsChips'
import { LegacyPoolColumnId } from '../columns'
import { LegacyPoolsFiltersDrawer } from '../drawers/LegacyPoolsFiltersDrawer'
import { LegacyPoolsSortDrawer } from '../drawers/LegacyPoolsSortDrawer'

const { Spacing } = SizesAndSpaces

export const LegacyPoolsFilters = ({
  hiddenCount,
  searchText,
  resetFilters,
  onSortingChange,
  onSearch,
  sortField,
  ...filterProps
}: {
  hiddenCount: number
  resetFilters: () => void
  children?: ReactNode
  onSortingChange: OnChangeFn<SortingState>
  sortField: LegacyPoolColumnId
  searchText: string
  onSearch: (value: string) => void
} & LegacyPoolsChipsProps) => {
  const isMobile = useIsMobile()
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            <LegacyPoolsSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
          </Grid>
          <Grid size={6}>
            <LegacyPoolsFiltersDrawer
              hiddenCount={hiddenCount}
              resetFilters={resetFilters}
              searchText={searchText}
              onSearch={onSearch}
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
          <LegacyPoolsChips {...filterProps} />
        </Grid>
      )}
      {!isMobile && <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />}
    </Grid>
  )
}
