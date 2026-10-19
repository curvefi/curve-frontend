import type { ReactNode } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { Select, type SelectProps } from '@ui/components/Select'

export type ChartSelectOptions<TOption extends string = string> = {
  options: readonly (TOption | { value: TOption; label: ReactNode })[]
  activeOption: TOption
  setActiveOption: (option: TOption) => void
}

type ChartSelectProps<TOption extends string> = ChartSelectOptions<TOption> & {
  isLoading?: boolean
  inputProps?: SelectProps['inputProps']
}

export const ChartSelect = <TOption extends string = string>({
  options,
  activeOption,
  setActiveOption,
  isLoading = false,
  inputProps,
}: ChartSelectProps<TOption>) => (
  <Select
    variant="ghost"
    value={activeOption}
    onChange={event => setActiveOption(event.target.value as TOption)}
    size="tiny"
    sx={{ alignSelf: 'center' }}
    disabled={isLoading}
    inputProps={inputProps}
    MenuProps={{
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      transformOrigin: { vertical: 'top', horizontal: 'right' },
    }}
  >
    {options
      .map(option => (typeof option === 'string' ? { value: option, label: option.toUpperCase() } : option))
      .map(({ value, label }) => (
        <MenuItem value={value} key={value}>
          <Typography variant="bodySBold">{label}</Typography>
        </MenuItem>
      ))}
  </Select>
)
