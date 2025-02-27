import { Dispatch } from 'react'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { FormControlLabel } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'

type AdvancedModeSwitcherProps = {
  label?: string
  advancedMode: [boolean, Dispatch<boolean>]
}

export const AdvancedModeSwitcher = ({ advancedMode: [checked, onChange], label }: AdvancedModeSwitcherProps) => {
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
