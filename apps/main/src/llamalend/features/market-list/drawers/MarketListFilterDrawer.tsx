import React from 'react'
import { LlamaMarket, LlamaMarketsResult } from '@/llamalend/entities/llama-markets'
import { Button, Grid, Stack } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DrawerHeader } from '@ui-kit/shared/ui/DrawerHeader'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { HiddenMarketsResetFilters } from '../chips/HiddenMarketsResetFilters'
import { LlamaListFilterChips } from '../chips/LlamaListFilterChips'
import { MarketTypeFilterChips } from '../chips/MarketTypeFilterChips'
import { LendingMarketsFilters } from '../LendingMarketsFilters'

const { Spacing } = SizesAndSpaces

type Props = {
  userHasPositions: LlamaMarketsResult['userHasPositions'] | undefined
  hasFavorites: boolean | undefined
  data: LlamaMarket[]
  minLiquidity?: number
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
} & FilterProps<string>

export const MarketListFilterDrawer = ({
  userHasPositions,
  hasFavorites,
  data,
  minLiquidity,
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  ...filterProps
}: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)
  return (
    <SwipeableDrawer
      button={
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={openDrawer}
          data-testid="btn-drawer-filter-lamalend-markets"
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
        sx={{ px: Spacing.sm, pb: Spacing.md, overflow: 'auto', flex: 1 }}
        gap={Spacing.sm}
        data-testid="drawer-filter-menu-lamalend-markets"
      >
        <DrawerHeader title={t`Popular Filters`} />
        <Grid container spacing={Spacing.sm}>
          <MarketTypeFilterChips {...filterProps} />
          <LlamaListFilterChips userHasPositions={userHasPositions} hasFavorites={hasFavorites} {...filterProps} />
        </Grid>
        <DrawerHeader title={t`Extras Filters`} />
        <LendingMarketsFilters
          columnFilters={filterProps.columnFiltersById}
          setColumnFilter={filterProps.setColumnFilter}
          data={data}
          minLiquidity={minLiquidity}
        />
      </Stack>
    </SwipeableDrawer>
  )
}
