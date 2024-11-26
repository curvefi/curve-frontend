import Select from '@mui/material/Select'
import type { SelectProps } from '@mui/material/Select/Select'
import type { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { useCallback } from 'react'

export type CompactDropDownProps<T extends string | number> = Omit<SelectProps<T>, 'onChange'> & {
  onChange: (newValue: T) => void
}

export const CompactDropDown = <T extends string | number>({ onChange, inputProps, ...props }: CompactDropDownProps<T>) => (
  <Select<T>
    onChange={useCallback((v: SelectChangeEvent<T>) => onChange(v.target.value as T), [onChange])}
    size="small"
    variant="standard"
    disableUnderline
    inputProps={{ sx: { display: 'flex', padding: 2, ...inputProps?.sx }, ...inputProps }}
    {...props}
  />
)
