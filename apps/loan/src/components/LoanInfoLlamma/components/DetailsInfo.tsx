import { TITLE_MAPPER, TITLE } from '@/constants'
import useStore from '@/store/useStore'

import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import TokenLabel from '@/components/TokenLabel'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellUtilization from '@/components/PageMarketList/components/TableCellUtilization'

const DetailsInfo = ({ rChainId, collateralId }: { rChainId: ChainId; collateralId: string }) => {
  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[collateralId])
  const collateralDataCached = useStore((state) => state.storeCache.collateralDatasMapper[rChainId]?.[collateralId])

  const collateralDataCachedOrApi = collateralData ?? collateralDataCached

  const props = { rChainId, collateralId, collateralDataCachedOrApi }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: React.ReactNode; show?: boolean; className?: string }[][] = [
    [
      { titleKey: TITLE.tokenCollateral, content: <TokenLabel showAlert {...props} type="collateral" /> },
      { titleKey: TITLE.tokenBorrow, content: <TokenLabel showAlert {...props} type="borrow" /> },
      { titleKey: TITLE.rate, content: <TableCellRate {...props} /> },
    ],
    [
      { titleKey: TITLE.available, content: <TableCellUtilization {...props} type='available' /> },
      { titleKey: TITLE.cap, content: <TableCellUtilization {...props} type='cap' /> },
      { titleKey: TITLE.totalBorrowed, content: <TableCellUtilization {...props} type='borrowed' /> },
      { titleKey: TITLE.totalCollateral, content: <TableCellTotalCollateral {...props} /> }
    ]
  ]

  return (
    <ListInfoItemsWrapper>
      {contents.map((groupedContents, idx) => (
        <ListInfoItems key={`items${idx}`}>
          {groupedContents.map(({ titleKey, content }) => (
            <ListInfoItem title={TITLE_MAPPER[titleKey].name}>{content}</ListInfoItem>
          ))}
        </ListInfoItems>
      ))}
    </ListInfoItemsWrapper>
  )
}

export default DetailsInfo
