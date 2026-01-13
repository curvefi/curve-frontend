import { type MouseEvent, ReactNode, useCallback, useMemo, useRef } from 'react'
import { Stack } from '@mui/material'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { type DeepKeys } from '@tanstack/table-core'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { CheckIcon } from '@ui-kit/shared/icons/CheckIcon'
import { type FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { parseListFilter, serializeListFilter } from '@ui-kit/shared/ui/DataTable/filters'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'

const { Spacing } = SizesAndSpaces

/**
 * A filter for tanstack tables that allows multi-select of string values.
 */
export const MultiSelectFilter = <TKeys, TColumnId extends string>({
  columnFiltersById,
  setColumnFilter,
  data,
  defaultText,
  defaultTextMobile,
  renderItem,
  selectedItemRender,
  field,
  id,
}: FilterProps<TColumnId> & {
  data: TKeys[]
  defaultText: string
  defaultTextMobile: string
  field: DeepKeys<TKeys>
  id: TColumnId
  renderItem?: (value: string) => ReactNode
  selectedItemRender?: (value: string) => ReactNode
}) => {
  const isMobile = useIsMobile()
  const selectRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef) ?? []
  const [isOpen, open, close] = useSwitch(false)
  const options = useMemo(() => getUniqueSortedStrings(data, field), [data, field])
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
      const options = selectedOptions?.includes(value)
        ? selectedOptions.filter((v) => v !== value)
        : [...(selectedOptions ?? []), value]
      setColumnFilter(id, serializeListFilter(options))
    },
    [setColumnFilter, id, selectedOptions],
  )

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
        size={isMobile ? 'medium' : 'small'}
        renderValue={() =>
          selectedOptions?.length && selectedOptions.length < options.length ? (
            selectedOptions.map((optionId, index) => (
              <MenuItem
                key={optionId}
                sx={{
                  display: 'inline-flex', // display inline to avoid wrapping
                  '&': { padding: 0, height: 0, minHeight: 0 }, // reset height and padding, no need when inline
                  gap: Spacing.xs, // default spacing is too large inline
                  ...(index > 0 && { ':before': { content: '", "' } }),
                }}
              >
                {selectedItemRender?.(optionId) ?? renderItem?.(optionId) ?? optionId}
              </MenuItem>
            ))
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
          // eslint-disable-next-line react-hooks/refs
          anchorEl={selectRef.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          slotProps={{
            list: { sx: { minWidth: Math.round(selectWidth || 100) + 'px', paddingBlock: 0 } },
            paper: { sx: { maxWidth: '100%' } },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            borderBottom={(t) => `1px solid ${t.design.Layer[3].Outline}`}
            padding={Spacing.sm}
            component="li"
          >
            <Button
              color="ghost"
              size="extraSmall"
              onClick={onClear}
              data-testid="multi-select-clear"
              sx={{ paddingInline: 0 }}
            >{t`Clear Selection`}</Button>
          </Stack>
          {options.map((optionId) => {
            const isSelected = selectedOptions?.includes(optionId)
            return (
              <InvertOnHover hoverRef={menuRef} key={optionId}>
                <MenuItem
                  ref={menuRef}
                  value={optionId}
                  className={isSelected ? 'Mui-selected' : ''}
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
