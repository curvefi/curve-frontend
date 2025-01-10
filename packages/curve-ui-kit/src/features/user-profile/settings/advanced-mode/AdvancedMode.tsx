import { t } from '@lingui/macro'
import Switch from '@mui/material/Switch'

import { Label, Setting } from '../Setting'
import useUserProfileStore from '../../store'

export const AdvancedMode = () => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const setAdvancedMode = useUserProfileStore((state) => state.setAdvancedMode)

  return (
    <Setting>
      <Label>{t`Advanced Mode`}</Label>
      <Switch checked={isAdvancedMode} onChange={() => setAdvancedMode(!isAdvancedMode)} color="primary" size="small" />
    </Setting>
  )
}
