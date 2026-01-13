import React, { useCallback, useMemo, useRef } from 'react'
import { Button, MenuItem } from '@mui/material'
import Typography from '@mui/material/Typography'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CaretSortIcon } from '@ui-kit/shared/icons/CaretSort'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns'
import { useLlamaMarketSortOptions } from '../hooks/useLlamaMarketSortOptions'

const { Spacing, ButtonSize } = SizesAndSpaces

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
}

export const MarketSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const [open, openDrawer, closeDrawer] = useSwitch(false)
  const sortOptions = useLlamaMarketSortOptions()
  const menuRef = useRef<HTMLLIElement | null>(null)

  const selectedOption = useMemo(() => sortOptions.find((option) => option.id === sortField), [sortOptions, sortField])

  const handleSort = useCallback(
    (id: LlamaMarketColumnId) => {
      onSortingChange([{ id, desc: true }])
      closeDrawer()
    },
    [onSortingChange, closeDrawer],
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
          data-testid="btn-drawer-sort-lamalend-markets"
        >
          {t`Sort`} <CaretSortIcon sx={{ marginLeft: Spacing.sm }} />
        </Button>
      }
      open={open}
      setOpen={closeDrawer}
    >
      <DrawerHeader title={t`Sort by`} />
      <DrawerItems data-testid="drawer-sort-menu-lamalend-markets">
        {sortOptions.map(({ id, label }) => (
          <InvertOnHover hoverRef={menuRef} key={id}>
            <MenuItem
              ref={menuRef}
              value={id}
              className={selectedOption?.id === id ? 'Mui-selected' : ''}
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
      </DrawerItems>
    </SwipeableDrawer>
  )
}
