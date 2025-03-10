import { get, sortBy, sortedUniq } from 'lodash'
import * as React from 'react'
import { type MouseEvent, ReactNode, useCallback, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import Typography from '@mui/material/Typography'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import useHeightResizeObserver from '@ui-kit/hooks/useHeightResizeObserver'

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
  const ref = useRef(null)
  const [selectWidth] = useHeightResizeObserver(ref) ?? []
  const [isOpen, open, close] = useSwitch(false)
  const options = useMemo(() => getSortedStrings(data, field), [data, field])
  const id = cleanColumnId(field)
  const value = (columnFilters[id] ?? []) as string[]
  const onClear = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setColumnFilter(id, [])
      close()
    },
    [id, setColumnFilter, close],
  )

  const onSelectChange = useCallback(
    // click in the "Clear Selection" Box, outside the button, mui calls this with filter=[undefined] 😞
    (e: SelectChangeEvent<string[]>) => setColumnFilter(id, (e.target.value as string[]).filter(Boolean)),
    [setColumnFilter, id],
  )
  const sx = { minWidth: Math.round(selectWidth || 100) + 'px' }
  console.log({ selectWidth, sx })
  return (
    <>
      <Select
        ref={ref}
        name={id}
        open={false}
        onOpen={open}
        onClose={close}
        multiple
        displayEmpty
        value={value}
        onChange={onSelectChange}
        fullWidth
        data-testid={`multi-select-filter-${id}`}
        size="small"
        renderValue={(selected) =>
          selected.length && selected.length < options.length ? (
            selected.map((optionId, index) => (
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
          open={isOpen}
          anchorEl={ref.current}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          MenuListProps={{ sx }}
        >
          <Box sx={{ borderBottom: (t) => `1px solid ${t.design.Layer[3].Outline}` }} component="li">
            <Button color="ghost" size="extraSmall" onClick={onClear}>{t`Clear Selection`}</Button>
          </Box>
          {options.map((optionId) => (
            <MenuItem key={optionId} value={optionId}>
              {renderItem?.(optionId) ?? optionId}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  )
}
