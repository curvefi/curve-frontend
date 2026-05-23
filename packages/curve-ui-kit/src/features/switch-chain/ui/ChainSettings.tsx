import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'

export const ChainSettings = ({
  showTestnets,
  setShowTestnets,
}: {
  showTestnets: boolean
  setShowTestnets: (showTestnets: boolean) => void
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Typography variant="headingXsBold" sx={{ display: 'inline-block', marginLeft: 4, marginRight: 2 }}>
      {t`Show testnets`}
    </Typography>

    <Switch
      checked={showTestnets}
      onChange={() => setShowTestnets(!showTestnets)}
      color="primary"
      slotProps={{ input: { 'aria-label': t`Show testnets` } }}
      size="small"
    />
  </Box>
)
