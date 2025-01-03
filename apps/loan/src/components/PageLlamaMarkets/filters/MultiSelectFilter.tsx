import { Fragment, ReactNode, useMemo } from 'react'
import { get, identity, sortBy, sortedUniq } from 'lodash'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'

const getSortedStrings = <T extends any>(data: T[], field: DeepKeys<T>) => {
  const values = data.map((d) => get(d, field) as string) // todo: validate value is string with typescript
  return sortedUniq(sortBy(values, identity))
}

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
  const id = field.replaceAll('.', '_')
  const value = (columnFilters[id] ?? []) as string[]
  return (
    <Select
      multiple
      displayEmpty
      value={value}
      onChange={(e) => setColumnFilter(id, e.target.value)}
      fullWidth
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
