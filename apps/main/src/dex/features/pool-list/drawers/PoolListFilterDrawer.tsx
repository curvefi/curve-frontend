import React from 'react'
import { Button, Grid, Stack } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenMarketsResetFilters } from '@ui-kit/shared/ui/DataTable/HiddenMarketsResetFilters'
import { DrawerHeader } from '@ui-kit/shared/ui/DrawerHeader'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'
import { PoolListFilterChips } from '../components/PoolListFilterChips'

const { Spacing } = SizesAndSpaces

type Props = {
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  searchText: string
  onSearch: (value: string) => void
} & FilterProps<PoolColumnId>

export const PoolListFilterDrawer = ({
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  searchText,
  onSearch,
  ...filterProps
}: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)
  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={openDrawer}
          data-testid="btn-drawer-filter-dex-pools"
        >
          {t`Filter`} {hiddenMarketCount ? `(${hiddenMarketCount})` : ''} <FilterIcon sx={{ marginLeft: Spacing.sm }} />
        </Button>
      }
      open={open}
      setOpen={closeDrawer}
    >
      <DrawerHeader title={t`Filters`}>
        <HiddenMarketsResetFilters
          hiddenMarketCount={hiddenMarketCount}
          resetFilters={resetFilters}
          hasFilters={hasFilters}
        />
      </DrawerHeader>
      <Stack
        direction="column"
        sx={{ paddingInline: Spacing.sm, pb: Spacing.md, overflow: 'auto', flex: 1 }}
        gap={Spacing.sm}
        data-testid="drawer-filter-menu-dex-pools"
      >
        <DrawerHeader title={t`Popular Filters`} />
        <Grid container spacing={Spacing.sm}>
          <PoolListFilterChips {...filterProps} />
        </Grid>
      </Stack>
    </SwipeableDrawer>
  )
}
