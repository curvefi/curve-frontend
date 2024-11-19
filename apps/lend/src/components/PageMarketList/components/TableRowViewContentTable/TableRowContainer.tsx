import type { TableRowProps } from '@/components/PageMarketList/types'

import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import { parseSearchTermMapper } from '@/hooks/useSearchTermMapper'
import networks from '@/networks'
import useStore from '@/store/useStore'

import { TrSearchedTextResult } from 'ui/src/Table'
import TableRow from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import TableRowMobile from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowMobile'

const TableRowContainer = (
  props: Omit<TableRowProps, 'owmDataCachedOrApi' | 'loanExists' | 'userActiveKey' | 'handleCellClick'>
) => {
  const { rChainId, api, owmId, filterTypeKey, searchTermMapper } = props
  const params = useParams()
  const navigate = useNavigate()

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const marketsBalancesMapper = useStore((state) => state.user.marketsBalancesMapper)
  const owmDatasCachedMapper = useStore((state) => state.storeCache.owmDatasMapper[rChainId])
  const owmDatasMapper = useStore((state) => state.markets.owmDatasMapper[rChainId])
  const searchedByAddresses = useStore((state) => state.marketList.searchedByAddresses[owmId])
  const setMarketsStateByKey = useStore((state) => state.markets.setStateByKey)

  const owmDataCached = owmDatasCachedMapper?.[owmId]
  const owmData = owmDatasMapper?.[owmId]
  const owmDataCachedOrApi = owmData ?? owmDataCached
  const userActiveKey = helpers.getUserActiveKey(api, owmDataCachedOrApi)
  const loanExists = loansExistsMapper[userActiveKey]?.loanExists ?? false

  const parsedSearchTermMapper = useMemo(
    () => parseSearchTermMapper(owmDataCachedOrApi, searchedByAddresses, searchTermMapper),
    [owmDataCachedOrApi, searchTermMapper, searchedByAddresses]
  )

  const handleCellClick = (target?: EventTarget) => {
    if (target && (target as HTMLElement).nodeName === 'BUTTON') return

    // update view
    if (filterTypeKey === 'borrow') {
      setMarketsStateByKey('marketDetailsView', loanExists ? 'user' : 'market')
    } else if (filterTypeKey === 'supply') {
      const { gauge = '0', vaultShares = '0' } = marketsBalancesMapper[userActiveKey] ?? {}
      const haveSupply = +gauge + +vaultShares > 0
      setMarketsStateByKey('marketDetailsView', haveSupply ? 'user' : 'market')
    }

    if (filterTypeKey === 'supply') {
      navigate(getVaultPathname(params, owmId, 'deposit'))
    } else if (loanExists) {
      navigate(getLoanManagePathname(params, owmId, 'loan'))
    } else {
      navigate(getLoanCreatePathname(params, owmId, 'create'))
    }
  }

  const tableRowProps: TableRowProps = {
    ...props,
    owmDataCachedOrApi,
    loanExists,
    userActiveKey,
    handleCellClick,
  }

  return (
    <>
      {isMdUp ? <TableRow key={owmId} {...tableRowProps} /> : <TableRowMobile key={owmId} {...tableRowProps} />}
      {searchedByAddresses && Object.keys(searchedByAddresses).length > 0 && (
        <TrSearchedTextResult
          colSpan={10}
          id={owmId}
          isMobile={!isMdUp}
          result={searchedByAddresses}
          searchTermMapper={parsedSearchTermMapper}
          scanAddressPath={networks[rChainId].scanAddressPath}
        />
      )}
    </>
  )
}

export default TableRowContainer
