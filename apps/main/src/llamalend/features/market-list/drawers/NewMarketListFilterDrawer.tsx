import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { Grid } from '@mui/material'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
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
  hiddenCount: number
  resetFilters: () => void
  userPositionsTab?: MarketRateType
} & FilterProps<LlamaMarketColumnId>

export const NewMarketListFilterDrawer = ({
  hasFavorites,
  data,
  hiddenCount,
  resetFilters,
  userPositionsTab,
  ...filterProps
}: Props) => {
  const [open, , closeDrawer, toggleDrawer] = useSwitch(false)
  const hasPopularFilters = userPositionsTab === MarketRateType.Borrow || !userPositionsTab
  const showUserChips = !userPositionsTab
  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <SelectableChip
          size="medium"
          selected={open}
          icon={<FilterIcon />}
          toggle={toggleDrawer}
          data-testid="btn-drawer-filter-lamalend-markets"
        />
      }
      open={open}
      setOpen={closeDrawer}
    >
      <DrawerHeader title={t`Filters`}>
        <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />
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
