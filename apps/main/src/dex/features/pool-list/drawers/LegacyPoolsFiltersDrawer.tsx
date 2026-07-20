import { useCallback } from 'react'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { HiddenCountResetButton } from '@ui-kit/shared/ui/DataTable/HiddenCountResetButton'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LegacyPoolsChips, LegacyPoolsChipsProps } from '../chips/LegacyPoolsChips'
import type { LegacyPoolColumnId } from '../columns'

const { Spacing } = SizesAndSpaces

type Props = {
  hiddenCount: number
  resetFilters: () => void
  searchText: string
  onSearch: (value: string) => void
} & LegacyPoolsChipsProps

export const LegacyPoolsFiltersDrawer = ({
  hiddenCount,
  resetFilters,
  searchText,
  onSearch,
  setColumnFilter,
  ...filterProps
}: Props) => {
  const [open, openDrawer, closeDrawer, , setOpen] = useSwitch(false)
  const setFilterAndClose = useCallback(
    (id: LegacyPoolColumnId, value: string | null) => {
      setColumnFilter(id, value)
      closeDrawer()
    },
    [setColumnFilter, closeDrawer],
  )
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
          {t`Filter`} {hiddenCount ? `(${hiddenCount})` : ''} <FilterIcon sx={{ marginLeft: Spacing.sm }} />
        </Button>
      }
      open={open}
      setOpen={setOpen}
    >
      <DrawerHeader title={t`Filters`}>
        <HiddenCountResetButton hiddenCount={hiddenCount} resetFilters={resetFilters} />
      </DrawerHeader>
      <Stack
        direction="column"
        data-testid="drawer-filter-menu-dex-pools"
        sx={{ gap: Spacing.sm, paddingInline: Spacing.sm, paddingBottom: Spacing.md, overflow: 'auto', flex: 1 }}
      >
        <DrawerHeader title={t`Popular Filters`} />
        <Grid container spacing={Spacing.sm}>
          <LegacyPoolsChips {...filterProps} setColumnFilter={setFilterAndClose} />
        </Grid>
      </Stack>
    </SwipeableDrawer>
  )
}
