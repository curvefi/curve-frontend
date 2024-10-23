import type { TableRowProps } from '@/components/PageMarketList/types'

import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import useStore from '@/store/useStore'

import TableRow from '@/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import TableRowMobile from '@/components/PageMarketList/components/TableRowViewContentTable/TableRowMobile'
import { useOneWayMarket } from '@/entities/chain'

const TableRowContainer = (
  props: Omit<TableRowProps, 'market' | 'loanExists' | 'userActiveKey' | 'handleCellClick'>
) => {
  const { rChainId, api, owmId, filterTypeKey } = props

  const params = useParams()
  const navigate = useNavigate()

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const marketsBalancesMapper = useStore((state) => state.user.marketsBalancesMapper)
  const setMarketsStateByKey = useStore((state) => state.markets.setStateByKey)

  const market = useOneWayMarket(rChainId, owmId).data!
  const userActiveKey = helpers.getUserActiveKey(api, market)
  const loanExists = loansExistsMapper[userActiveKey]?.loanExists ?? false

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
    market,
    loanExists,
    userActiveKey,
    handleCellClick,
  }

  return isMdUp ? <TableRow key={owmId} {...tableRowProps} /> : <TableRowMobile key={owmId} {...tableRowProps} />
}

export default TableRowContainer
