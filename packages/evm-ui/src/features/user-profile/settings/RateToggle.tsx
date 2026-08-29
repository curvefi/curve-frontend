import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useUserProfileStore } from '../store'

export const RateToggle = () => {
  const rateDisplay = useRateDisplay()
  const setRateDisplay = useUserProfileStore(state => state.setRateDisplay)

  return (
    <ToggleButtonGroup
      value={rateDisplay}
      exclusive
      size="small"
      onChange={(_, value: unknown) => {
        if (value === 'apr' || value === 'apy') setRateDisplay(value)
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
