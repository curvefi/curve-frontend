import { type MouseEvent, ReactNode, useCallback, useRef } from 'react'
import { Box, Stack } from '@mui/material'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { HiddenInlinedItems } from '@ui-kit/shared/ui/DataTable/HiddenInlinedItems'
import { getInlinedItemsVisibility } from '@ui-kit/shared/ui/DataTable/HiddenInlinedItems.utils'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { Select } from '@ui-kit/shared/ui/Select'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * A filter for tanstack tables that allows multi-select of string values.
 */
export const MultiSelectFilter = <TColumnId extends string>({
  columnFiltersById,
  setColumnFilter,
  options,
  defaultText = t`All`,
  defaultTextMobile,
  renderItem,
  selectedItemRender,
  id,
}: FilterProps<TColumnId> & {
  options: string[]
  defaultText?: string
  defaultTextMobile: string
  id: TColumnId
  renderItem?: (value: string) => ReactNode
  selectedItemRender?: (value: string) => ReactNode
}) => {
  const isMobile = useIsMobile()
  const selectRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef)
  const [isOpen, open, close] = useSwitch(false)
  const selectedOptions = parseListFilter(columnFiltersById[id])
  const onClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setColumnFilter(id, null)
      close()
    },
    [id, setColumnFilter, close],
  )

  const onItemClicked = useCallback(
    // click in the "Clear Selection" Box, outside the button, mui calls this with filter=[undefined] 😞
    ({ currentTarget }: MouseEvent<HTMLLIElement>) => {
      const value = currentTarget.getAttribute('value')!
      const nextOptions = selectedOptions?.includes(value)
        ? selectedOptions.filter(v => v !== value)
        : [...(selectedOptions ?? []), value]
      setColumnFilter(id, serializeListFilter(nextOptions))
    },
    [setColumnFilter, id, selectedOptions],
  )

  const [visibleSelectedOptions, hiddenSelectedOptions] = getInlinedItemsVisibility(selectedOptions)

  // the select component does a lot of stuff with its children, so we cannot add a wrapper for the theme inverter.
  // therefore, I was forced to reimplement the menu separate from the select component.
  return (
    <>
      <Select
        ref={selectRef}
        name={id}
        open={false}
        onOpen={open}
        onClose={close}
        displayEmpty
        fullWidth
        value=""
        data-testid={`multi-select-filter-${id}`}
        size="medium"
        sx={{ '& .MuiSelect-select': { gap: Spacing.xs } }}
        renderValue={() =>
          selectedOptions?.length ? (
            <>
              {visibleSelectedOptions.map(optionId => (
                <Box component="span" key={optionId} sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  {selectedItemRender?.(optionId) ?? renderItem?.(optionId) ?? optionId}
                </Box>
              ))}
              <HiddenInlinedItems
                hiddenSelectedItemsLength={hiddenSelectedOptions.length}
                renderItem={label => selectedItemRender?.(label) ?? renderItem?.(label)}
              />
            </>
          ) : (
            <Typography variant="bodySBold">{isMobile ? defaultTextMobile : defaultText}</Typography>
          )
        }
      ></Select>
      {isOpen !== undefined && (
        <Menu
          data-testid={`menu-${id}`}
          open={isOpen}
          onClose={close}
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{
            list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } },
            paper: { sx: { maxWidth: '100%' } },
          }}
        >
          <Stack
            direction="row"
            component="li"
            sx={{
              justifyContent: 'space-between',
              borderBottom: t => `1px solid ${t.design.Layer[3].Outline}`,
              padding: Spacing.sm,
            }}
          >
            <Button
              color="ghost"
              size="extraSmall"
              onClick={onClear}
              data-testid="multi-select-clear"
              sx={{ paddingInline: 0 }}
            >{t`Clear Selection`}</Button>
          </Stack>
          {options.map(optionId => {
            const isSelected = selectedOptions?.includes(optionId)
            return (
              <InvertOnHover hoverRef={menuRef} key={optionId}>
                <MenuItem
                  ref={menuRef}
                  value={optionId}
                  selected={isSelected}
                  onClick={onItemClicked}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {renderItem?.(optionId) ?? optionId}
                  {isSelected && <CheckIcon sx={{ marginLeft: Spacing.sm }} />}
                </MenuItem>
              </InvertOnHover>
            )
          })}
        </Menu>
      )}
    </>
  )
}
