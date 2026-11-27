import { useConnection } from 'wagmi'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { useMarketsTable } from './hooks/useMarketsTable'
import { MarketsTable } from './MarketsTable'
import { MarketsTableFooter } from './MarketsTableFooter'
import { UserPositionsTables } from './UserPositionsTables'

/** Page for displaying the lending markets table. */
export const MarketsList = () => {
  const { address: userAddress } = useConnection()
  const { tableQuery, onReload } = useMarketsTable(userAddress)
  return (
    <ListPageLayout footer={<MarketsTableFooter />}>
      {userAddress && <UserPositionsTables onReload={onReload} tableQuery={tableQuery} />}
      <MarketsTable onReload={onReload} tableQuery={tableQuery} />
    </ListPageLayout>
  )
}
