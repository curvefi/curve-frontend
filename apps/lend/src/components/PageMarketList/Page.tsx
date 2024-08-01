import type { NextPage } from 'next'
import type { FilterListProps, SearchParams, TableLabelsMapper } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { getPath } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import { AppPageContainer } from '@/ui/AppPage'
import DocumentHead from '@/layout/DocumentHead'
import MarketList from '@/components/PageMarketList/index'
import Settings from '@/layout/Settings'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams, api } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const setStateByKey = useStore((state) => state.marketList.setStateByKey)

  const [loaded, setLoaded] = useState(false)
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)

  const { signerAddress } = api ?? {}

  const SIGNER_FILTER_MAPPER: FilterListProps[] = [
    { id: 'all', displayName: t`All` },
    { id: 'leverage', displayName: t`Leverage` },
    { id: 'user', displayName: t`My markets` },
  ]

  const DEFAULT_FILTER_MAPPER: FilterListProps[] = [
    { id: 'all', displayName: t`All` },
    { id: 'leverage', displayName: t`Leverage` },
  ]

  const filterList = signerAddress ? SIGNER_FILTER_MAPPER : DEFAULT_FILTER_MAPPER

  const FILTER_TYPE_MAPPER = {
    borrow: { id: 'borrow', displayName: t`Borrow` },
    supply: { id: 'supply', displayName: t`Lend` },
  }

  const TABLE_LABELS_MAPPER: TableLabelsMapper = {
    isInMarket: { name: '' },
    name: { name: t`Markets` },
    available: { name: t`Available` },
    cap: { name: t`Supplied` },
    utilization: { name: t`Utilization %` },
    rateBorrow: { name: t`Borrow APY` },
    rateLend: { name: t`Lend APR` },
    myDebt: { name: t`My debt` },
    myHealth: { name: t`My health` },
    myVaultShares: { name: t`Earning deposits` },
    tokenCollateral: { name: t`Collateral` },
    tokenBorrow: { name: t`Borrow` },
    tokenSupply: { name: t`Lend` },
    totalCollateralValue: { name: t`Collateral value` },
    totalDebt: { name: t`Borrowed` },
    totalLiquidity: { name: t`TVL` },
    totalApr: { name: t`Total APR` },
    points: { name: t`Points` },
    leverage: { name: t`Leverage` },
  }

  useEffect(() => {
    scrollToTop()
    setStateByKey('initialLoaded', false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePath = (updatedSearchParams: Partial<SearchParams>) => {
    const { filterKey, filterTypeKey, hideSmallMarkets, searchText, sortBy, sortByOrder } = {
      ...parsedSearchParams,
      ...updatedSearchParams,
    }

    let searchPath = '?'
    if (filterKey && filterKey !== 'all') searchPath += `filter=${filterKey}`
    if (filterTypeKey && filterTypeKey !== 'borrow') searchPath += `${_querySymbol(searchPath)}type=${filterTypeKey}`
    if (hideSmallMarkets === false) searchPath += `${_querySymbol(searchPath)}hideSmallMarkets=false`
    if (searchText) searchPath += `${_querySymbol(searchPath)}search=${encodeURIComponent(searchText)}`
    if (sortBy) searchPath += `${_querySymbol(searchPath)}sortBy=${sortBy}`
    if (sortByOrder && sortByOrder !== 'desc') searchPath += `${_querySymbol(searchPath)}sortByOrder=${sortByOrder}`

    const pathname = getPath(params, `${ROUTE.PAGE_MARKETS}${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    setLoaded(false)

    if (!pageLoaded || isLoadingApi) return

    const hideSmallMarkets = searchParams.get('hideSmallMarkets') || 'true'

    const parsedSearchParams = {
      filterKey: searchParams.get('filter') || 'all',
      filterTypeKey: searchParams.get('type') || 'borrow',
      hideSmallMarkets: hideSmallMarkets === 'true',
      sortBy: searchParams.get('sortBy') || '',
      sortByOrder: searchParams.get('sortByOrder') || 'desc',
      searchText: decodeURIComponent(searchParams.get('search') || ''),
    } as SearchParams

    setStateByKey('searchParams', parsedSearchParams)
    setParsedSearchParams(parsedSearchParams)
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi, searchParams])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      <StyledAppPageContainer $maxWidth={parsedSearchParams?.filterTypeKey === 'supply' ? '990px' : ''}>
        {rChainId && parsedSearchParams && (
          <MarketList
            rChainId={rChainId}
            isLoaded={loaded}
            api={api}
            searchParams={parsedSearchParams}
            filterList={filterList}
            filterTypeMapper={FILTER_TYPE_MAPPER}
            tableLabelsMapper={TABLE_LABELS_MAPPER}
            updatePath={updatePath}
          />
        )}
      </StyledAppPageContainer>
      <Settings showScrollButton />
    </>
  )
}

const StyledAppPageContainer = styled(AppPageContainer)<{ $maxWidth: string }>`
  ${({ $maxWidth }) => {
    if ($maxWidth) {
      return `
        max-width: ${$maxWidth};
        margin-left: auto;
        margin-right: auto;
      `
    }
  }}
`

function _querySymbol(searchPath: string) {
  return searchPath === '?' ? '' : '&'
}

export default Page
