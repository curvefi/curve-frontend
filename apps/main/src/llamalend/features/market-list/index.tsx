import { useConnection } from 'wagmi'
import { ListPageLayout } from '@evm-ui/widgets/ListPageLayout'
import { useMarketsTable } from './hooks/useMarketsTable'
import { MarketsTable } from './MarketsTable'
import { MarketsTableFooter } from './MarketsTableFooter'
import { UserPositionsTables } from './UserPositionsTables'

/** Page for displaying the lending markets table. */
export const MarketsList = () => {
  const { address } = useConnection()
  const { tableQuery, onReload } = useMarketsTable(address)
  return (
    <ListPageLayout footer={<MarketsTableFooter />}>
      <UserPositionsTables onReload={onReload} tableQuery={tableQuery} />
      <MarketsTable onReload={onReload} tableQuery={tableQuery} />
    </ListPageLayout>
  )
}
