import { Dispatch, FunctionComponent } from 'react'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type AdvancedModeSwitcherProps = {
  label?: string
  advancedMode: [boolean, Dispatch<boolean>]
}

export const AdvancedModeSwitcher: FunctionComponent<AdvancedModeSwitcherProps> = ({
  advancedMode: [advancedMode, onChange],
  label,
}) => (
  <Box display="inline-flex" alignItems="center">
    <Switch
      checked={advancedMode}
      onChange={() => onChange(!advancedMode)}
      color="primary"
      inputProps={{ ...(label && { 'aria-label': label }) }}
      size="small"
    />

    {label && (
      <Typography
        variant="headingXsBold"
        display="inline-block"
        // lineHeight to center vertically with the switch. Extra '&' specificity needed to override default.
        sx={{ marginLeft: 2, marginRight: 4, '&': { lineHeight: '37px' } }}
      >
        {label}
      </Typography>
    )}
  </Box>
)
