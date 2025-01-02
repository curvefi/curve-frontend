import { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table'
import { Dispatch, Fragment, ReactNode, SetStateAction, useMemo } from 'react'
import { uniq } from 'lodash'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'

// todo: doesn't this exist somewhere?
const getByDeepKey = <T extends unknown>(obj: T, key: DeepKeys<T>) => {
  const keys = key.split('.')
  return keys.reduce((acc, k) => (acc as any)[k], obj) as string
}

export const MultiSelectFilter = <T extends unknown>({
  columnFilters,
  setColumnFilters,
  data,
  defaultText,
  renderItem,
  id,
}: {
  columnFilters: ColumnFilter[]
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>
  data: T[]
  defaultText: string
  id: DeepKeys<T>
  renderItem?: (value: string) => ReactNode
}) => {
  const options = useMemo(() => uniq(data.map((d) => getByDeepKey(d, id))), [data, id])
  return (
    <Select
      multiple
      displayEmpty
      value={(columnFilters.find((f) => f.id === id)?.value as string[]) || []}
      onChange={(e) => setColumnFilters([{ id, value: e.target.value }])}
      fullWidth
      size="small"
      renderValue={(selected) => (
        <Typography component="span">
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
