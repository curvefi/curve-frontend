
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@/ui/ListInfo'
import TableCellRate from '@/components/PageMarketList/components/TableCellRate'
import TableCellTotalCollateral from '@/components/PageMarketList/components/TableCellTotalCollateral'
import TableCellUtilization from '@/components/PageMarketList/components/TableCellUtilization'
import TokenLabel from '@/components/TokenLabel'
import { TITLE } from '@/constants'
import useStore from '@/store/useStore'

const DetailsInfo = ({
  rChainId,
  collateralId,
  titleMapper,
}: {
  rChainId: ChainId
  collateralId: string
  titleMapper: TitleMapper
}) => {
  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[collateralId])
  const collateralDataCached = useStore((state) => state.storeCache.collateralDatasMapper[rChainId]?.[collateralId])

  const collateralDataCachedOrApi = collateralData ?? collateralDataCached

  const props = { rChainId, collateralId, collateralDataCachedOrApi }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: React.ReactNode; }[][] = [
    [
      { titleKey: TITLE.tokenCollateral, content: <TokenLabel {...props} type="collateral" /> },
      { titleKey: TITLE.tokenBorrow, content: <TokenLabel {...props} type="borrow" /> },
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
        <ListInfoItems key={`contents${idx}`}>
          {groupedContents.map(({ titleKey, content }, idx) => (
            <ListInfoItem key={`content${idx}`} {...titleMapper[titleKey]}>
              {content}
            </ListInfoItem>
          ))}
        </ListInfoItems>
      ))}
    </ListInfoItemsWrapper>
  )
}

export default DetailsInfo
