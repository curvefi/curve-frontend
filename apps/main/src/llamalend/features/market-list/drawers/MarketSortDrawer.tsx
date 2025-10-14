import React, { useCallback, useMemo, useRef } from 'react'
import { Button, MenuItem, Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { CaretSortIcon } from '@ui-kit/shared/icons/CaretSort'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { DrawerHeader } from '@ui-kit/shared/ui/DrawerHeader'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns.enum'
import { useLlamaMarketSortOptions } from '../hooks/useLlamaMarketSortOptions'

const { Spacing } = SizesAndSpaces

type Props = {
  onSortingChange: OnChangeFn<SortingState>
  sortField: LlamaMarketColumnId
}

export const MarketSortDrawer = ({ onSortingChange, sortField }: Props) => {
  const [open, setOpen] = React.useState(false)
  const sortOptions = useLlamaMarketSortOptions()
  const menuRef = useRef<HTMLLIElement | null>(null)

  const selectedOption = useMemo(() => sortOptions.find((option) => option.id === sortField), [sortOptions, sortField])

  const handleSort = useCallback(
    (id: LlamaMarketColumnId, label: React.ReactNode) => {
      onSortingChange([{ id, desc: true }])
      setOpen(false)
    },
    [onSortingChange],
  )

  return (
    <SwipeableDrawer
      button={
        <Button variant="outlined" size="small" fullWidth onClick={() => setOpen(true)}>
          Sort <CaretSortIcon sx={{ marginLeft: Spacing.sm }} />
        </Button>
      }
      open={open}
      setOpen={setOpen}
    >
      <DrawerHeader title={t`Sort by`} />
      <Stack direction="column" sx={{ px: Spacing.sm, pb: Spacing.md, overflow: 'auto', flex: 1 }}>
        {sortOptions.map(({ id, label }) => {
          const isSelected = selectedOption?.id === id
          return (
            <InvertOnHover hoverEl={menuRef.current} key={id}>
              <MenuItem
                ref={menuRef}
                value={id}
                className={isSelected ? 'Mui-selected' : ''}
                onClick={() => handleSort(id, label)}
                sx={{ justifyContent: 'space-between' }}
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
