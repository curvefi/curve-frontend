import { useCallback, useMemo, useRef } from 'react'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { CaretSortIcon } from '@evm-ui/shared/icons/CaretSort'
import { CheckIcon } from '@evm-ui/shared/icons/CheckIcon'
import { InvertOnHover } from '@evm-ui/shared/ui/InvertOnHover'
import { SelectableChip } from '@evm-ui/shared/ui/SelectableChip'
import { DrawerHeader } from '@evm-ui/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@evm-ui/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@evm-ui/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { MenuItem, MenuList } from '@mui/material'
import Typography from '@mui/material/Typography'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'

const { Spacing, ButtonSize } = SizesAndSpaces

type TableSortDrawerOption<TSortId extends string> = {
  id: TSortId
  label: string
}

type TableSortDrawerProps<TSortId extends string> = {
  buttonTestId: string
  drawerTestId: string
  onSortingChange: OnChangeFn<SortingState>
  options: readonly TableSortDrawerOption<TSortId>[]
  sortField: TSortId
}

/** Mobile sort drawer for DataTable screens. Extracted from the LlamaLend markets list. */
export const TableSortDrawer = <TSortId extends string>({
  buttonTestId,
  drawerTestId,
  onSortingChange,
  options,
  sortField,
}: TableSortDrawerProps<TSortId>) => {
  const [open, , closeDrawer, toggleDrawer, setOpen] = useSwitch(false)
  const menuRef = useRef<HTMLLIElement | null>(null)

  const selectedOption = useMemo(() => options.find(option => option.id === sortField), [options, sortField])

  const handleSort = useCallback(
    (id: TSortId) => {
      onSortingChange([{ id, desc: true }])
      closeDrawer()
    },
    [onSortingChange, closeDrawer],
  )

  return (
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      button={
        <SelectableChip
          size="medium"
          selected={open}
          icon={<CaretSortIcon />}
          toggle={toggleDrawer}
          data-testid={buttonTestId}
        />
      }
      open={open}
      setOpen={setOpen}
    >
      <DrawerHeader title={t`Sort by`} />
      <DrawerItems data-testid={drawerTestId}>
        <MenuList disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: Spacing.sm }}>
          {options.map(({ id, label }) => (
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
