import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { useDexPoolListV2 } from '@evm-ui/hooks/useFeatureFlags'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { LegacyPoolsTable } from './LegacyPoolsTable'
import { PoolsTable } from './PoolsTable'
import { UserPositionsTable } from './UserPositionsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()
  const isBetaPoolListEnabled = useDexPoolListV2()

  return (
    <ListPageLayout>
      {network &&
        (isBetaPoolListEnabled ? (
          <>
            <UserPositionsTable network={network} />
            <PoolsTable network={network} />
          </>
        ) : (
          <LegacyPoolsTable network={network} />
        ))}
    </ListPageLayout>
  )
}
