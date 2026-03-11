import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'

export type TimeOption<TTimeOption extends string = string> = {
  options: readonly TTimeOption[]
  activeOption: TTimeOption
  setActiveOption: (newTimeOption: TTimeOption) => void
  ghost?: boolean
}

export const SelectTimeOption = <TTimeOption extends string = string>({
  options,
  activeOption,
  setActiveOption,
  isLoading = false,
  ghost = false,
}: TimeOption<TTimeOption> & {
  isLoading: boolean
}) => (
  <Select
    value={activeOption}
    onChange={(event) => {
      if (event.target.value != null) setActiveOption(event.target.value as TTimeOption)
    }}
    size="small"
    sx={{
      alignSelf: 'center',
      // There's a Notion ticket to create a proper 'ghost' variant for MUI Select.
      ...(ghost && {
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
        '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
      }),
    }}
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
