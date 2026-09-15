import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { useDexPoolListV2 } from '@evm-ui/hooks/useFeatureFlags'
import { ListPageLayout } from '@evm-ui/widgets/ListPageLayout'
import { LegacyPoolsTable } from './LegacyPoolsTable'
import { PoolsTable } from './PoolsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()

  return (
    <ListPageLayout>
      {network && (isBetaPoolListEnabled ? <PoolsTable network={network} /> : <LegacyPoolsTable network={network} />)}
    </ListPageLayout>
  )
}
