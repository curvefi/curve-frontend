import Switch from '@mui/material/Switch'
import { useUserProfileStore } from '../store'

export const ShowDeprecatedMarketsToggle = () => {
  const showDeprecatedMarkets = useUserProfileStore(state => state.showDeprecatedMarkets)
  const setShowDeprecatedMarkets = useUserProfileStore(state => state.setShowDeprecatedMarkets)
  return <Switch checked={showDeprecatedMarkets} onChange={(_, value) => setShowDeprecatedMarkets(value)} />
}
