import { useCallback, useMemo, useRef } from 'react'
import { Button, MenuItem, MenuList } from '@mui/material'
import Typography from '@mui/material/Typography'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { InvertOnHover } from '@ui/components/InvertOnHover'
import { DrawerHeader } from '@ui/components/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui/components/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui/components/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { CaretSortIcon } from '@ui/icons/CaretSort'
import { CheckIcon } from '@ui/icons/CheckIcon'
import { t } from '@ui/lib/i18n'
import { LegacyPoolColumnId } from '../columns'

const { Spacing, ButtonSize } = SizesAndSpaces

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LegacyPoolColumnId
}

const DEX_POOL_SORT_OPTIONS = [
  { id: LegacyPoolColumnId.Volume, label: t`Volume` },
  { id: LegacyPoolColumnId.Tvl, label: t`Total Value Locked` },
  { id: LegacyPoolColumnId.RewardsCrv, label: t`Rewards CRV` },
  { id: LegacyPoolColumnId.RewardsIncentives, label: t`Rewards Incentives` },
] as const

export const LegacyPoolsSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)

  const menuRef = useRef<HTMLLIElement | null>(null)

  const selectedOption = useMemo(() => DEX_POOL_SORT_OPTIONS.find(option => option.id === sortField), [sortField])

  const handleSort = useCallback(
    (id: LegacyPoolColumnId) => {
      onSortingChange([{ id, desc: true }])
      closeDrawer()
    },
    [onSortingChange, closeDrawer],
  )

  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <Button variant="outlined" size="small" fullWidth onClick={openDrawer} data-testid="btn-drawer-sort-dex-pools">
          {t`Sort`} <CaretSortIcon sx={{ marginLeft: Spacing.sm }} />
        </Button>
      }
      open={open}
      setOpen={closeDrawer}
    >
      <DrawerHeader title={t`Sort by`} />
      <DrawerItems data-testid="drawer-sort-menu-dex-pools">
        <MenuList disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: Spacing.sm }}>
          {DEX_POOL_SORT_OPTIONS.map(({ id, label }) => (
            <InvertOnHover hoverRef={menuRef} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                selected={selectedOption?.id === id}
                onClick={() => handleSort(id)}
                sx={{ justifyContent: 'space-between', minHeight: ButtonSize.sm }}
              >
                <Typography component="span" variant="bodyMBold">
                  {label}
                </Typography>
                {selectedOption?.id === id && <CheckIcon sx={{ marginLeft: Spacing.sm }} />}
              </MenuItem>
            </InvertOnHover>
          ))}
        </MenuList>
      </DrawerItems>
    </SwipeableDrawer>
  )
}
