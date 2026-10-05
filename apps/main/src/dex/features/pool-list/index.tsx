import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { PoolExpandedPanelActions } from './components/PoolExpandedPanelActions'
import { PoolsTable } from './PoolsTable'
import { UserPositionsTable } from './UserPositionsTable'

export const PoolsList = () => {
  const network = useNetworkFromUrl()

  return (
    <ListPageLayout>
      {network && (
        <>
          <UserPositionsTable network={network} Actions={PoolExpandedPanelActions} />
          <PoolsTable network={network} Actions={PoolExpandedPanelActions} />
        </>
      )}
    </ListPageLayout>
  )
}
