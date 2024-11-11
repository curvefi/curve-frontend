import { FunctionComponent } from 'react'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'

type AdvancedModeSwitcherProps = {
  label?: string,
  advancedMode: boolean,
  onChange: (value: boolean) => void
}

export const AdvancedModeSwitcher: FunctionComponent<AdvancedModeSwitcherProps> = ({ advancedMode, onChange, label }) => (
  <Box display="inline-flex" marginRight={4} alignItems="center">
    <Switch
      checked={advancedMode}
      onChange={() => onChange(!advancedMode)}
      color="primary"
      inputProps={{ ...label && { 'aria-label': label } }}
    />
    {label && (
      <Typography variant="headingXsBold" display="inline-block" sx={{ textTransform: 'uppercase', lineHeight: '37px' }}>
        {label}
      </Typography>
    )}
  </Box>
)