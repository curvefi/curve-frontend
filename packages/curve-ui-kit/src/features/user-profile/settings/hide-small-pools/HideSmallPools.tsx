import { t } from '@ui-kit/lib/i18n'
import Switch from '@mui/material/Switch'

import { SettingLabel, Setting } from '../Setting'
import useUserProfileStore from '../../store'

export const HideSmallPools = () => {
  const hideSmallPools = useUserProfileStore((state) => state.hideSmallPools)
  const setHideSmallPools = useUserProfileStore((state) => state.setHideSmallPools)

  return (
    <Setting>
      <SettingLabel>{t`Hide Small Pools`}</SettingLabel>
      <Switch
        checked={hideSmallPools}
        onChange={() => setHideSmallPools(!hideSmallPools)}
        color="primary"
        size="small"
      />
    </Setting>
  )
}
