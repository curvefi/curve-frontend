import { Fragment, ReactNode, useMemo } from 'react'
import { get, identity, sortBy, sortedUniq } from 'lodash'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { cleanColumnId } from '@ui-kit/shared/ui/TableColumnVisibilityPopover'

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
      renderValue={(selected) => (
        <Typography component="span" variant="bodyMBold">
          {selected.length && selected.length < options.length
            ? selected.map((optionId, index) => (
                <Fragment key={optionId}>
                  {index > 0 && ', '}
                  {renderItem?.(optionId) ?? optionId}
                </Fragment>
              ))
            : defaultText}
        </Typography>
      )}
    >
      {options.map((optionId) => (
        <MenuItem key={optionId} value={optionId}>
          {renderItem?.(optionId) ?? optionId}
        </MenuItem>
      ))}
    </Select>
  )
}
