import { useConnection } from 'wagmi'
import { PrototypeTour } from '@/llamalend/features/prototype-intro/PrototypeTour'
import { MarketRateType } from '@evm-ui/types/market'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
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
      <PrototypeTour
        surface="list"
        ready={!!tableQuery.data && !tableQuery.error}
        positionsReady={
          !!address &&
          !!tableQuery.data &&
          !tableQuery.isLoading &&
          !tableQuery.error &&
          tableQuery.data.markets.some(market => market.userHasPositions?.[MarketRateType.Borrow])
        }
      />
      <UserPositionsTables onReload={onReload} tableQuery={tableQuery} />
      <MarketsTable onReload={onReload} tableQuery={tableQuery} />
    </ListPageLayout>
  )
}
