import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolChains } from '@/dex/queries/pool-list.query'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { LegacyPoolListTable } from './LegacyPoolListTable'
import { PoolListTable } from './PoolListTable'

export const Page = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()
  const { data: supportedPoolChains = [], isLoading } = usePoolChains({}, isBetaPoolListEnabled && !!network)
  /**
   * Prices API v2 does not cover every full DEX network that's supplied by the curve-api.
   * Unsupported: Moonbeam, Kava, Avalanche, Celo, Aurora, X-Layer, zkSync, Mantle.
   */
  const isSupported = supportedPoolChains.some(({ chainId }) => chainId === network?.chainId)

  if (!network || (isBetaPoolListEnabled && isLoading)) {
    return <ListPageWrapper>{null}</ListPageWrapper>
  }

  return (
    <ListPageWrapper>
      {isBetaPoolListEnabled && isSupported ? (
        <PoolListTable network={network} />
      ) : (
        <LegacyPoolListTable network={network} />
      )}
    </ListPageWrapper>
  )
}
