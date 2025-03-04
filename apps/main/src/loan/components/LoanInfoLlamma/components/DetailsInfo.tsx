import { TITLE } from '@/loan/constants'
import useStore from '@/loan/store/useStore'
import networks from '@/loan/networks'
import ListInfoItem, { ListInfoItems, ListInfoItemsWrapper } from '@ui/ListInfo'
import TokenLabel from '@/loan/components/TokenLabel'
import TableCellRate from '@/loan/components/SharedCells/TableCellRate'
import TableCellTotalCollateral from '@/loan/components/SharedCells/TableCellTotalCollateral'
import TableCellUtilization from '@/loan/components/SharedCells/TableCellUtilization'
import { ChainId, TitleKey, TitleMapper } from '@/loan/types/loan.types'
import { ReactNode } from 'react'

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

  const props = {
    rChainId,
    blockchainId: networks[rChainId].networkId,
    collateralId,
    collateralDataCachedOrApi,
  }

  // prettier-ignore
  const contents: { titleKey: TitleKey; content: ReactNode; }[][] = [
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
