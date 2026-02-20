import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { Button, Grid } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenMarketsResetFilters } from '@ui-kit/shared/ui/DataTable/HiddenMarketsResetFilters'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { LlamaListMarketChips } from '../chips/LlamaListMarketChips'
import { LlamaListUserChips } from '../chips/LlamaListUserChips'
import type { LlamaMarketColumnId } from '../columns'
import { LendingMarketsFilters } from '../LendingMarketsFilters'

const { Spacing } = SizesAndSpaces

type Props = {
  hasFavorites: boolean | undefined
  data: LlamaMarket[]
  minLiquidity?: number
  hiddenMarketCount?: number
  resetFilters: () => void
  hasFilters: boolean
  userPositionsTab?: MarketRateType
} & FilterProps<LlamaMarketColumnId>

export const MarketListFilterDrawer = ({
  hasFavorites,
  data,
  minLiquidity,
  hiddenMarketCount,
  resetFilters,
  hasFilters,
  userPositionsTab,
  ...filterProps
}: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)
  const hasPopularFilters = userPositionsTab === MarketRateType.Borrow || !userPositionsTab
  const showUserChips = !userPositionsTab
  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
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
      <DrawerItems data-testid="drawer-filter-menu-lamalend-markets">
        {hasPopularFilters && <DrawerHeader title={t`Popular Filters`} />}
        <Grid container spacing={Spacing.sm}>
          {hasPopularFilters && <LlamaListMarketChips {...filterProps} />}
          {showUserChips && <LlamaListUserChips hasFavorites={hasFavorites} {...filterProps} />}
        </Grid>
        <DrawerHeader title={t`Extras Filters`} />
        <LendingMarketsFilters {...filterProps} data={data} />
      </DrawerItems>
    </SwipeableDrawer>
  )
}
