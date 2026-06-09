import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolChains } from '@/dex/queries/pool-list.query'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { PoolListApiTable } from './PoolListApiTable'
import { PoolListTable } from './PoolListTable'

export const Page = () => {
  const isBetaPoolListEnabled = useDexPoolListV2()

  return isBetaPoolListEnabled ? <BetaPoolListPage /> : <StablePoolListPage />
}

const StablePoolListPage = () => {
  const network = useNetworkFromUrl()

  return <ListPageWrapper>{network && <PoolListTable network={network} />}</ListPageWrapper>
}

const BetaPoolListPage = () => {
  const network = useNetworkFromUrl()
  const { data: supportedPoolChains, isLoading } = usePoolChains({})
  /**
   * Prices API v2 does not cover every full DEX network that's supplied by the curve-api.
   * Unsupported: Moonbeam, Kava, Avalanche, Celo, Aurora, X-Layer, zkSync, Mantle.
   */
  const isSupported = supportedPoolChains?.some(({ chainId }) => chainId === network?.chainId)

  return (
    <ListPageWrapper>
      {network &&
        !isLoading &&
        (isSupported ? <PoolListApiTable network={network} /> : <PoolListTable network={network} />)}
    </ListPageWrapper>
  )
}
