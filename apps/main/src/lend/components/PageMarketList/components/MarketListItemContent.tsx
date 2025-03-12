import styled from 'styled-components'
import MarketListItemHeader from '@/lend/components/PageMarketList/components/MarketListItemHeader'
import MarketListTable from '@/lend/components/PageMarketList/components/TableRowViewContentTable'
import type { MarketListItemResult, PageMarketList, TableLabel } from '@/lend/components/PageMarketList/types'
import useStore from '@/lend/store/useStore'
import { breakpoints } from '@ui/utils'

const MarketListItemContent = ({
  idx,
  marketListItem,
  ...props
}: {
  idx: number
  pageProps: PageMarketList
  marketListItem: MarketListItemResult
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  tableLabels: TableLabel[]
}) => {
  const { rChainId } = props.pageProps
  const { address } = marketListItem

  const tableSettings = useStore((state) => state.marketList.tableRowsSettings[address])

  if (address === 'all') {
    return <MarketListTable {...props} {...marketListItem} tableSettings={tableSettings} />
  }

  return (
    <>
      <MarketListItemHeader idx={idx} rChainId={rChainId} {...marketListItem} />
      <TableWrapper>
        <MarketListTable {...props} {...marketListItem} tableSettings={tableSettings} />
      </TableWrapper>
    </>
  )
}

const TableWrapper = styled.div`
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);

  @media (min-width: ${breakpoints.xs}rem) {
    margin: 0 var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 0 var(--spacing-normal);
  }
`

export default MarketListItemContent
