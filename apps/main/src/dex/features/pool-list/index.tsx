import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolChains } from '@/dex/queries/pool-list.query'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { LegacyPoolsTable } from './LegacyPoolsTable'
import { PoolsTable } from './PoolsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()
  const { data: supportedPoolChains, isLoading } = usePoolChains({}, isBetaPoolListEnabled)
  /**
   * Prices API v2 does not cover every full DEX network that's supplied by the curve-api.
   * Unsupported: Moonbeam, Kava, Avalanche, Celo, Aurora, X-Layer, zkSync, Mantle.
   */
  const isSupported = supportedPoolChains?.some(({ chainId }) => chainId === network?.chainId)

  return (
    <ListPageWrapper>
      {network &&
        (!isBetaPoolListEnabled || !isLoading) &&
        (isBetaPoolListEnabled && isSupported ? (
          <PoolsTable network={network} />
        ) : (
          <LegacyPoolsTable network={network} />
        ))}
    </ListPageWrapper>
  )
}
