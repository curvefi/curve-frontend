import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { TrSearchedTextResult } from 'ui/src/Table'
import TableRow from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRow'
import TableRowMobile from '@/lend/components/PageMarketList/components/TableRowViewContentTable/TableRowMobile'
import type { TableRowProps } from '@/lend/components/PageMarketList/types'
import { useOneWayMarket } from '@/lend/entities/chain'
import { parseSearchTermMapper } from '@/lend/hooks/useSearchTermMapper'
import { helpers } from '@/lend/lib/apiLending'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/lend/utils/utilsRouter'

const TableRowContainer = (
  props: Omit<TableRowProps, 'market' | 'loanExists' | 'userActiveKey' | 'handleCellClick'>,
) => {
  const { rChainId, api, owmId, filterTypeKey, searchTermMapper } = props
  const params = useParams() as NetworkUrlParams
  const { push } = useRouter()

  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansExistsMapper = useStore((state) => state.user.loansExistsMapper)
  const marketsBalancesMapper = useStore((state) => state.user.marketsBalancesMapper)
  const searchedByAddresses = useStore((state) => state.marketList.searchedByAddresses[owmId])
  const setMarketsStateByKey = useStore((state) => state.markets.setStateByKey)

  const market = useOneWayMarket(rChainId, owmId).data!
  const userActiveKey = helpers.getUserActiveKey(api, market)
  const loanExists = loansExistsMapper[userActiveKey]?.loanExists ?? false

  const parsedSearchTermMapper = useMemo(
    () => parseSearchTermMapper(market, searchedByAddresses, searchTermMapper),
    [market, searchTermMapper, searchedByAddresses],
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
      push(getVaultPathname(params, owmId, 'deposit'))
    } else if (loanExists) {
      push(getLoanManagePathname(params, owmId, 'loan'))
    } else {
      push(getLoanCreatePathname(params, owmId, 'create'))
    }
  }

  const tableRowProps: TableRowProps = {
    ...props,
    market,
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
