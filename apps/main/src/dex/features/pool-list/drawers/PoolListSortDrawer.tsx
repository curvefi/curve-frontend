import { useRef } from 'react'
import { MenuItem, MenuList } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CaretSortIcon } from '@ui-kit/shared/icons/CaretSort'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolListSortableColumn } from '../hooks/usePoolListUrlState'

const { Spacing, ButtonSize } = SizesAndSpaces

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  options: readonly { id: PoolListSortableColumn; label: string }[]
  sortField: PoolListSortableColumn
}

export const PoolListSortDrawer = ({ onSortingChange, options, sortField }: Props) => {
  const [open, , closeDrawer, toggleDrawer, setOpen] = useSwitch(false)
  const menuRef = useRef<HTMLLIElement | null>(null)

  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <SelectableChip
          size="medium"
          selected={open}
          icon={<CaretSortIcon />}
          toggle={toggleDrawer}
          data-testid="btn-drawer-sort-dex-pools"
        />
      }
      open={open}
      setOpen={setOpen}
    >
      <DrawerHeader title={t`Sort by`} />
      <DrawerItems data-testid="drawer-sort-menu-dex-pools">
        <MenuList disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: Spacing.sm }}>
          {options.map(({ id, label }) => (
            <InvertOnHover hoverRef={menuRef} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                selected={sortField === id}
                onClick={() => {
                  onSortingChange([{ id, desc: true }])
                  closeDrawer()
                }}
                sx={{ justifyContent: 'space-between', minHeight: ButtonSize.sm }}
              >
                <Typography component="span" variant="bodyMBold">
                  {label}
                </Typography>
                {sortField === id && <CheckIcon sx={{ marginLeft: Spacing.sm }} />}
              </MenuItem>
            </InvertOnHover>
          ))}
        </MenuList>
      </DrawerItems>
    </SwipeableDrawer>
  )
}
