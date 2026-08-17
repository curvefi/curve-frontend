import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { useDexPoolListV2 } from '@ui-kit/hooks/useFeatureFlags'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
import { LegacyPoolsTable } from './LegacyPoolsTable'
import { PoolsTable } from './PoolsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()

  return (
    <ListPageWrapper>
      {network && (isBetaPoolListEnabled ? <PoolsTable network={network} /> : <LegacyPoolsTable network={network} />)}
    </ListPageWrapper>
  )
}
