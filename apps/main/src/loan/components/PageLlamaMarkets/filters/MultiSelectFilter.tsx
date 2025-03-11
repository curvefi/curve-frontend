import { get, sortBy, sortedUniq } from 'lodash'
import * as React from 'react'
import { type MouseEvent, ReactNode, useCallback, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Get all unique string values from a field in an array of objects and sort them alphabetically.
 * TODO: validate T[K] is string with typescript. DeepKeys makes it hard to do this.
 */
const getSortedStrings = <T extends any, K extends DeepKeys<T>>(data: T[], field: K) => {
  const values = data.map((d) => get(d, field) as string)
  return sortedUniq(sortBy(values, (val) => val.toLowerCase()))
}

/**
 * A filter for tanstack tables that allows multi-select of string values.
 */
export const MultiSelectFilter = <T extends unknown>({
  columnFilters,
  setColumnFilter,
  data,
  defaultText,
  renderItem,
  field,
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: T[]
  defaultText: string
  field: DeepKeys<T>
  renderItem?: (value: string) => ReactNode
}) => {
  const selectRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const [selectWidth] = useResizeObserver(selectRef) ?? []
  const [isOpen, open, close] = useSwitch(false)
  const options = useMemo(() => getSortedStrings(data, field), [data, field])
  const id = cleanColumnId(field)
  const selectedOptions = columnFilters[id] as string[] | undefined
  const onClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setColumnFilter(id, [])
      close()
    },
    [id, setColumnFilter, close],
  )

  const onItemClicked = useCallback(
    // click in the "Clear Selection" Box, outside the button, mui calls this with filter=[undefined] 😞
    ({ currentTarget }: MouseEvent<HTMLLIElement>) => {
      const value = currentTarget.getAttribute('value')!
      setColumnFilter(
        id,
        selectedOptions?.includes(value)
          ? selectedOptions.filter((v) => v !== value)
          : [...(selectedOptions ?? []), value],
      )
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
        size="small"
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
                {renderItem?.(optionId) ?? optionId}
              </MenuItem>
            ))
          ) : (
            <Typography variant="bodyMBold">{defaultText}</Typography>
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
          MenuListProps={{ sx: { minWidth: Math.round(selectWidth || 100) + 'px' } }}
        >
          <Box sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[3].Outline}` }} component="li">
            <Button color="ghost" size="extraSmall" onClick={onClear}>{t`Clear Selection`}</Button>
          </Box>
          {options.map((optionId) => (
            <InvertOnHover hoverRef={menuRef} key={optionId}>
              <MenuItem
                ref={menuRef}
                value={optionId}
                className={selectedOptions?.includes(optionId) ? 'Mui-selected' : ''}
                onClick={onItemClicked}
              >
                {renderItem?.(optionId) ?? optionId}
              </MenuItem>
            </InvertOnHover>
          ))}
        </Menu>
      )}
    </>
  )
}
