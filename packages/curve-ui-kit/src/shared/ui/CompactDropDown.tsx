import { Select } from '@mui/material'
import type { SelectProps } from '@mui/material/Select/Select'
import type { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { useCallback } from 'react'

export type CompactDropDownProps<T extends string | number> = Omit<SelectProps<T>, 'onChange'> & {
  onChange: (newValue: T) => void
}

export const CompactDropDown = <T extends string | number>({ onChange, sx, SelectDisplayProps, ...props }: CompactDropDownProps<T>) => (
  <Select<T>
    onChange={useCallback((v: SelectChangeEvent<T>) => onChange(v.target.value as T), [onChange])}
    size="small"
    sx={{ "::before": { content: "none" }, ...sx }} // removes the bottom border
    SelectDisplayProps={{ style: { paddingBottom: 1, ...SelectDisplayProps?.style }, ...SelectDisplayProps }}
    {...props}
  />
)
