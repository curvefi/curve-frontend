import { useConnection } from 'wagmi'
import { q } from '@ui-kit/types/util'
import { ListPageWrapper } from '@ui-kit/widgets/ListPageWrapper'
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
      <UserPositionsTables onReload={onReload} tableQuery={q(tableQuery)} />
      <MarketsTable onReload={onReload} tableQuery={q(tableQuery)} />
    </ListPageWrapper>
  )
}
