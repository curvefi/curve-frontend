import { FunctionComponent } from 'react'
import Switch from '@mui/material/Switch'
import Box from '@mui/material/Box'
import { Typography } from 'curve-ui-kit/src/shared/ui/Typography'
import { t } from '@lingui/macro'

type AdvancedModeSwitcherProps = { advancedMode: boolean, onChange: (value: boolean) => void }

export const AdvancedModeSwitcher: FunctionComponent<AdvancedModeSwitcherProps> = ({ advancedMode, onChange }) => (
  <Box display="inline-flex" marginRight={4} paddingTop={2}>
    <Switch
      checked={advancedMode}
      onChange={() => onChange(!advancedMode)}
      color="primary"
      inputProps={{ 'aria-label': t`Advanced mode switch` }}
    />
    <Typography variant="headingXsBold" display="inline-block"  sx={{ textTransform: 'uppercase', lineHeight: '37px' }}>
      {t`Advanced`}
    </Typography>
  </Box>
)