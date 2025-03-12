import Switch from '@mui/material/Switch'
import { t } from '@ui-kit/lib/i18n'
import useUserProfileStore from '../../store'
import { SettingLabel, Setting } from '../Setting'

export const HideSmallPoolsSetting = () => {
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
