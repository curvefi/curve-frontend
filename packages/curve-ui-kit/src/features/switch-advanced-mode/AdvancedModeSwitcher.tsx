import { Dispatch, FunctionComponent } from 'react'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { FormControlLabel } from '@mui/material'
import { t } from '@lingui/macro'

type AdvancedModeSwitcherProps = {
  label?: string
  advancedMode: [boolean, Dispatch<boolean>]
}

export const AdvancedModeSwitcher: FunctionComponent<AdvancedModeSwitcherProps> = ({
  advancedMode: [checked, onChange],
  label,
}) => {
  const control = (
    <Switch
      checked={checked}
      onChange={() => onChange(!checked)}
      inputProps={{ ...(!label && { 'aria-label': t`Advanced mode` }) }}
      size="small"
    />
  )
  return (
    <Box display="inline-flex" alignItems="center">
      {label ? <FormControlLabel control={control} label={label} sx={{ marginLeft: 2 }} /> : control}
    </Box>
  )
}
