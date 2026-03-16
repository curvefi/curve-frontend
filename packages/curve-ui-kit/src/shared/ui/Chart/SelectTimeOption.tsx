import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { Select } from '../Select'

export type TimeOption<TTimeOption extends string = string> = {
  options: readonly TTimeOption[]
  activeOption: TTimeOption
  setActiveOption: (newTimeOption: TTimeOption) => void
}

export const SelectTimeOption = <TTimeOption extends string = string>({
  options,
  activeOption,
  setActiveOption,
  isLoading = false,
}: TimeOption<TTimeOption> & {
  isLoading: boolean
}) => (
  <Select
    variant="ghost"
    value={activeOption}
    onChange={(event) => {
      if (event.target.value != null) setActiveOption(event.target.value as TTimeOption)
    }}
    size="small"
    sx={{ alignSelf: 'center' }}
    disabled={isLoading}
    MenuProps={{
      anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
      transformOrigin: { vertical: 'top', horizontal: 'right' },
    }}
  >
    {options.map((option) => (
      <MenuItem value={option} key={option}>
        <Typography variant="bodySBold" sx={{ textTransform: 'uppercase' }}>
          {option}
        </Typography>
      </MenuItem>
    ))}
  </Select>
)
