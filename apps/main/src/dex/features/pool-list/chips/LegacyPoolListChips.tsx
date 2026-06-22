import { type ReactNode } from 'react'
import Grid from '@mui/material/Grid'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegacyPoolColumnId } from '../columns'
import { LegacyPoolListFilterChips, LegacyPoolListFilterChipsProps } from '../components/LegacyPoolListFilterChips'
import { LegacyPoolListFilterDrawer } from '../drawers/LegacyPoolListFilterDrawer'
import { LegacyPoolSortDrawer } from '../drawers/LegacyPoolSortDrawer'

const { Spacing } = SizesAndSpaces

export const LegacyPoolListChips = ({
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
} & LegacyPoolListFilterChipsProps) => {
  const isMobile = useIsMobile()
  return (
    <Grid container spacing={Spacing.sm} size={{ mobile: 12, tablet: 'auto' }}>
      {isMobile ? (
        <Grid container columnSpacing={Spacing.sm} size={12}>
          <Grid size={6}>
            <LegacyPoolSortDrawer onSortingChange={onSortingChange} sortField={sortField} />
          </Grid>
          <Grid size={6}>
            <LegacyPoolListFilterDrawer
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
          <LegacyPoolListFilterChips {...filterProps} />
        </Grid>
      )}
      {!isMobile && <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />}
    </Grid>
  )
}
