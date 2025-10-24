import React, { useCallback, useMemo, useRef } from 'react'
import { Button, MenuItem, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CaretSortIcon } from '@ui-kit/shared/icons/CaretSort'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { DrawerHeader } from '@ui-kit/shared/ui/DrawerHeader'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PoolColumnId } from '../columns'

const { Spacing, ButtonSize } = SizesAndSpaces

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: PoolColumnId
}

// Temporary minimal sort options until full options are defined
const useDexPoolSortOptions = () =>
  [
    { id: PoolColumnId.Volume, label: t`Volume` },
    { id: PoolColumnId.Tvl, label: t`Total Value Locked` },
  ] as const

export const PoolSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)
  const sortOptions = useDexPoolSortOptions()
  const menuRef = useRef<HTMLLIElement | null>(null)

  const selectedOption = useMemo(() => sortOptions.find((option) => option.id === sortField), [sortOptions, sortField])

  const handleSort = useCallback(
    (id: PoolColumnId) => {
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
      <Stack
        direction="column"
        sx={{ paddingInline: Spacing.sm, paddingBlockEnd: Spacing.md, overflow: 'auto', flex: 1 }}
        data-testid="drawer-sort-menu-dex-pools"
      >
        {sortOptions.map(({ id, label }) => {
          const isSelected = selectedOption?.id === id
          return (
            <InvertOnHover hoverEl={menuRef.current} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                className={isSelected ? 'Mui-selected' : ''}
                onClick={() => handleSort(id)}
                sx={{ justifyContent: 'space-between', minHeight: ButtonSize.sm }}
              >
                <Typography component="span" variant="bodyMBold">
                  {label}
                </Typography>
                {isSelected && <CheckIcon sx={{ marginLeft: Spacing.sm }} />}
              </MenuItem>
            </InvertOnHover>
          )
        })}
      </Stack>
    </SwipeableDrawer>
  )
}
