import { FormControlLabel } from '@mui/material'
import Switch from '@mui/material/Switch'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

export const AdvancedModeSwitch = ({ label }: { label?: string }) => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const setAdvancedMode = useUserProfileStore((state) => state.setAdvancedMode)
  const control = (
    <Switch
      checked={isAdvancedMode}
      onChange={() => setAdvancedMode(!isAdvancedMode)}
      slotProps={{ input: { 'aria-label': t`Advanced mode` } }}
      size="small"
    />
  )
  return label ? <FormControlLabel control={control} label={label} sx={{ marginLeft: 2 }} /> : control
}
