import { get, identity, sortBy, sortedUniq } from 'lodash'
import { ReactNode, useMemo } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { cleanColumnId } from '@ui-kit/shared/ui/TableVisibilitySettingsPopover'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Get all unique string values from a field in an array of objects and sort them alphabetically.
 * TODO: validate T[K] is string with typescript. DeepKeys makes it hard to do this.
 */
const getSortedStrings = <T extends any, K extends DeepKeys<T>>(data: T[], field: K) => {
  const values = data.map((d) => get(d, field) as string)
  return sortedUniq(sortBy(values, identity))
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
  const options = useMemo(() => getSortedStrings(data, field), [data, field])
  const id = cleanColumnId(field)
  const value = (columnFilters[id] ?? []) as string[]
  return (
    <Select
      name={id}
      multiple
      displayEmpty
      value={value}
      onChange={(e) => setColumnFilter(id, e.target.value)}
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
    >
      {options.map((optionId) => (
        <MenuItem key={optionId} value={optionId}>
          {renderItem?.(optionId) ?? optionId}
        </MenuItem>
      ))}
    </Select>
  )
}
