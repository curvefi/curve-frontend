import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { useMarketContext } from '../features/market-context/MarketContext'
import { getMarketLeverageProviders } from '../llama.utils'

export const useMarketLeverageProviders = () => {
  const { chainId, controllerAddress } = useMarketContext()
  const [releaseChannel] = useReleaseChannel()

  return getMarketLeverageProviders(chainId, controllerAddress, releaseChannel)
}
