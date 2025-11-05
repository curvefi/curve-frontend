import Switch from '@mui/material/Switch'
import { useUserProfileStore } from '../store'

export const HideSmallPoolsSwitch = () => {
  const hideSmallPools = useUserProfileStore((state) => state.hideSmallPools)
  const setHideSmallPools = useUserProfileStore((state) => state.setHideSmallPools)
  return (
    <Switch checked={hideSmallPools} onChange={() => setHideSmallPools(!hideSmallPools)} color="primary" size="small" />
  )
}
