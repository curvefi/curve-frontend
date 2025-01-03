import { Fragment, useMemo } from 'react'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import { DeepKeys } from '@tanstack/table-core/build/lib/utils'
import { get } from 'lodash'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const getMaxValueFromData = <T extends any>(data: T[], field: DeepKeys<T>) =>
  data.reduce((acc, item) => Math.max(acc, get(item, field) as number), 0)

export const MinimumSliderFilter = <T extends unknown>({
  columnFilters,
  setColumnFilter,
  data,
  title,
  format,
  field,
}: {
  columnFilters: Record<string, unknown>
  setColumnFilter: (id: string, value: unknown) => void
  data: T[]
  title: string
  field: DeepKeys<T>
  format: (value: number) => string
}) => {
  const id = field.replaceAll('.', '_')
  const max = useMemo(() => getMaxValueFromData(data, field), [data, field])
  const [value] = (columnFilters[id] ?? [0, max]) as [number, number] // tanstack expects a [min, max] tuple
  return (
    <>
      <Select
        fullWidth
        size="small"
        displayEmpty
        renderValue={() => (
          <Typography variant="bodyMRegular">
            {`${title}: `}
            <Typography component="span" variant="bodyMBold">
              {format(value)}
            </Typography>
          </Typography>
        )}
        value=""
      >
        <Stack paddingBlock={3} paddingInline={4} direction="row" spacing={6}>
          <Typography>{format(0)}</Typography>
          <Slider
            aria-label={title}
            getAriaValueText={format}
            value={value}
            onChange={(_, min) => setColumnFilter(id, [min, max])}
            min={0}
            max={max}
            step={+max.toPrecision(2) / 100}
          />
          <Typography>{format(max)}</Typography>
        </Stack>
      </Select>
    </>
  )
}
