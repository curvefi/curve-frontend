import { t } from '@ui-kit/lib/i18n'
import Switch from '@mui/material/Switch'

import { SettingLabel, Setting } from '../Setting'
import useUserProfileStore from '../../store'

export const AdvancedMode = () => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const setAdvancedMode = useUserProfileStore((state) => state.setAdvancedMode)

  return (
    <Setting>
      <SettingLabel>{t`Advanced Mode`}</SettingLabel>
      <Switch checked={isAdvancedMode} onChange={() => setAdvancedMode(!isAdvancedMode)} color="primary" size="small" />
    </Setting>
  )
}
