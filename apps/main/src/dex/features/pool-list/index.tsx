import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolChains } from '@/dex/queries/pool-list.query'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { LegacyPoolsTable } from './LegacyPoolsTable'
import { PoolsTable } from './PoolsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()
  const shouldLoadSupportedPoolChains = Boolean(isBetaPoolListEnabled && network && !network.isLite)
  const { data: supportedPoolChains, isLoading } = usePoolChains({}, shouldLoadSupportedPoolChains)
  /**
   * Prices API v2 does not cover every full DEX network that's supplied by the curve-api.
   * Unsupported: Moonbeam, Kava, Avalanche, Celo, Aurora, X-Layer, zkSync, Mantle.
   */
  const isSupported = network?.isLite ? true : supportedPoolChains?.some(({ chainId }) => chainId === network?.chainId)
  const isPoolListReady = network?.isLite ? true : !isLoading

  return (
    <ListPageWrapper>
      {network &&
        (!isBetaPoolListEnabled || isPoolListReady) &&
        (isBetaPoolListEnabled && isSupported ? (
          <PoolsTable network={network} />
        ) : (
          <LegacyPoolsTable network={network} />
        ))}
    </ListPageWrapper>
  )
}
