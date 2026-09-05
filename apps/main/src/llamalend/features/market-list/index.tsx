import { useConnection } from 'wagmi'
import { ListPageWrapper } from '@evm-ui/widgets/ListPageWrapper'
import { useMarketsTable } from './hooks/useMarketsTable'
import { MarketsTable } from './MarketsTable'
import { MarketsTableFooter } from './MarketsTableFooter'
import { UserPositionsTables } from './UserPositionsTables'

/** Page for displaying the lending markets table. */
export const MarketsList = () => {
  const { address } = useConnection()
  const { tableQuery, onReload } = useMarketsTable(address)

  return (
    <ListPageWrapper footer={<MarketsTableFooter />}>
      <UserPositionsTables onReload={onReload} tableQuery={tableQuery} userAddress={address} />
      <MarketsTable onReload={onReload} tableQuery={tableQuery} />
    </ListPageWrapper>
  )
}
