import type { PageCollateralList, TableRowProps } from '@/loan/components/PageMarketList/types'

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { parseSearchTermMapper } from '@/loan/hooks/useSearchTermMapper'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'

import TableRow from '@/loan/components/PageMarketList/components/TableRow/TableRow'
import TableRowMobile from '@/loan/components/PageMarketList/components/TableRow/TableRowMobile'
import TrSearchedTextResult from '@ui/Table/TrSearchedTextResult'

type Props = Pick<PageCollateralList, 'rChainId' | 'params' | 'searchTermMapper' | 'searchParams' | 'titleMapper'> &
  Pick<TableRowProps, 'collateralId'> & {
    showDetail: string
    someLoanExists: boolean
    setShowDetail: React.Dispatch<React.SetStateAction<string>>
  }

const TableRowResult = ({
  rChainId,
  params,
  collateralId,
  searchParams,
  showDetail,
  someLoanExists,
  titleMapper,
  setShowDetail,
  ...props
}: Props) => {
  const { searchTermMapper } = props
  const navigate = useNavigate()

  const collateralDataCached = useStore((state) => state.storeCache.collateralDatasMapper[rChainId]?.[collateralId])
  const collateralData = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[collateralId])
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loanDetails = useStore((state) => state.loans.detailsMapper[collateralId])
  const loanExists = useStore((state) => state.loans.existsMapper[collateralId]?.loanExists)
  const searchedByAddresses = useStore((state) => state.collateralList.searchedByAddresses[collateralId])

  const collateralDataCachedOrApi = collateralData ?? collateralDataCached

  const parsedSearchTermMapper = useMemo(
    () => parseSearchTermMapper(collateralDataCachedOrApi, searchedByAddresses, searchTermMapper),
    [collateralDataCachedOrApi, searchTermMapper, searchedByAddresses],
  )

  const handleCellClick = () => {
    if (loanExists) {
      navigate(getLoanManagePathname(params, collateralId, 'loan'))
    } else {
      navigate(getLoanCreatePathname(params, collateralId))
    }
  }

  const tableRowProps = {
    collateralDataCachedOrApi,
    collateralId,
    loanDetails,
    loanExists,
    rChainId,
    searchParams,
    titleMapper,
    handleCellClick,
  }

  return (
    <>
      {!isMdUp ? (
        <TableRowMobile key={collateralId} {...tableRowProps} showDetail={showDetail} setShowDetail={setShowDetail} />
      ) : (
        <TableRow key={collateralId} {...tableRowProps} someLoanExists={someLoanExists} />
      )}

      {searchedByAddresses && Object.keys(searchedByAddresses).length > 0 && (
        <TrSearchedTextResult
          colSpan={10}
          id={collateralId}
          isMobile={!isMdUp}
          result={searchedByAddresses}
          searchTermMapper={parsedSearchTermMapper}
          scanAddressPath={networks[rChainId].scanAddressPath}
        />
      )}
    </>
  )
}

export default TableRowResult
