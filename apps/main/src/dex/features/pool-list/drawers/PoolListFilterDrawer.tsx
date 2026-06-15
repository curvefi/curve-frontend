import { useCallback } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolListFilterChips, type PoolListFilterChipsProps } from '../components/PoolListFilterChips'

const { Spacing } = SizesAndSpaces

type Props = {
  activeFilterCount: number
  resetFilters: () => void
} & PoolListFilterChipsProps

export const PoolListFilterDrawer = ({
  activeFilterCount,
  resetFilters,
  setPoolType,
  ...filterProps
}: Props) => {
  const [open, , closeDrawer, toggleDrawer, setOpen] = useSwitch(false)
  const setPoolTypeAndClose = useCallback<PoolListFilterChipsProps['setPoolType']>(
    value => {
      setPoolType(value)
      closeDrawer()
    },
    [closeDrawer, setPoolType],
  )

  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <SelectableChip
          size="medium"
          selected={open || !!activeFilterCount}
          icon={<FilterIcon />}
          label={activeFilterCount || undefined}
          toggle={toggleDrawer}
          data-testid="btn-drawer-filter-dex-pools"
        />
      }
      open={open}
      setOpen={setOpen}
    >
      <DrawerHeader title={t`Filters`}>
        <Button color="ghost" size="extraSmall" onClick={resetFilters} disabled={!activeFilterCount}>
          {t`Reset filters`}
        </Button>
      </DrawerHeader>
      <DrawerItems data-testid="drawer-filter-menu-dex-pools">
        <Stack direction="column" sx={{ gap: Spacing.sm, paddingInline: Spacing.sm, paddingBottom: Spacing.md }}>
          <DrawerHeader title={t`Popular Filters`} />
          <Grid container spacing={Spacing.sm}>
            <PoolListFilterChips {...filterProps} setPoolType={setPoolTypeAndClose} />
          </Grid>
        </Stack>
      </DrawerItems>
    </SwipeableDrawer>
  )
}
