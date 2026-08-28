import { t } from '@evm-ui/lib/i18n'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { type RateDisplay, useUserProfileStore } from '../store'

export const RateToggle = () => {
  const rateDisplay = useUserProfileStore(state => state.rateDisplay)
  const setRateDisplay = useUserProfileStore(state => state.setRateDisplay)

  return (
    <ToggleButtonGroup
      value={rateDisplay}
      exclusive
      size="small"
      onChange={(_, value: RateDisplay | null) => {
        if (value != null) setRateDisplay(value)
      }}
    >
      <ToggleButton value="apr" data-testid="rate-display-button-apr">
        {t`APR`}
      </ToggleButton>
      <ToggleButton value="apy" data-testid="rate-display-button-apy">
        {t`APY`}
      </ToggleButton>
    </ToggleButtonGroup>
  )
}
