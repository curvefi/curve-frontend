import type { NextPage } from 'next'
import type {
  FilterKey,
  FilterTypeKey,
  FilterMapper,
  SearchParams,
  TableLabelsMapper,
  BorrowKey,
} from '@/components/PageMarketList/types'

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
  const updateTableRowsSettings = useStore((state) => state.marketList.updateTableRowsSettings)

  const [loaded, setLoaded] = useState(false)
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)

  const { signerAddress } = api ?? {}

  const FILTER_MAPPER: FilterMapper = {
    all: { id: 'all', displayName: t`All` },
    user: { id: 'user', displayName: t`My markets` },
  }

  const FILTER_TYPE_MAPPER: FilterMapper = {
    borrow: { id: 'borrow', displayName: t`Borrow` },
    supply: { id: 'supply', displayName: t`Supply` },
  }

  // prettier-ignore
  const TABLE_LABELS_MAPPER: TableLabelsMapper = {
    isInMarket: { name: '' },
    name: { name: t`Markets` },
    available: { name: t`Available` },
    cap: { name: t`Supplied` },
    utilization: { name: t`Utilization %` },
    capUtilization: { name: t`Supplied / Utilization` },
    rateBorrow: { name: t`Borrow APY` },
    rateLend: { name: t`Lend APR` },
    myDebt: { name: t`My debt` },
    myHealth: { name: t`My health` },
    myWalletCollateral: { name: t`Wallet balance` },
    myWalletBorrowed: { name: t`Wallet balance` },
    myVaultShares: { name: t`My vault shares` },
    tokenCollateral: { name: t`Collateral` },
    tokenBorrow: { name: t`Borrow` },
    tokenSupply: { name: t`Supply` },
    totalCollateralValue: { name: t`Collateral value` },
    totalDebt: { name: t`Borrowed` },
    totalLiquidity: { name: t`TVL` },
    rewardsCRV: { name: 'CRV' },
    rewardsOthers: { name: t`Incentives` },
  }

  useEffect(() => {
    scrollToTop()
  }, [])

  const updatePath = (updatedSearchParams: Partial<SearchParams>) => {
    const { filterKey, filterTypeKey, hideSmallMarkets, searchText } = {
      ...parsedSearchParams,
      ...updatedSearchParams,
    }

    let searchPath = '?'
    if (filterKey && filterKey !== 'all') searchPath += `filter=${filterKey}`
    if (filterTypeKey && filterTypeKey !== 'borrow') searchPath += `${_querySymbol(searchPath)}type=${filterTypeKey}`
    if (hideSmallMarkets === false) searchPath += `${_querySymbol(searchPath)}hideSmallMarkets=false`
    if (searchText) searchPath += `${_querySymbol(searchPath)}search=${encodeURIComponent(searchText)}`

    updateTableRowsSettings(updatedSearchParams)

    const pathname = getPath(params, `${ROUTE.PAGE_MARKETS}${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    setLoaded(false)
    if (pageLoaded && !isLoadingApi) {
      const paramFilterKey = (searchParams.get('filter') || 'all').toLowerCase()
      const paramFilterTypeKey = (searchParams.get('type') || 'borrow').toLowerCase()
      const paramHideSmallPools = searchParams.get('hideSmallMarkets') || 'true'
      const sortByDefault: keyof TableLabelsMapper = paramFilterTypeKey === 'borrow' ? 'available' : 'totalLiquidity'
      const paramSortBy = (searchParams.get('sortBy') || sortByDefault).toLowerCase()
      const paramSortByOrder = (searchParams.get('borrow') || 'desc').toLowerCase()
      const searchText = decodeURIComponent(searchParams.get('search') || '')

      const parsedSearchParams = {
        filterKey: paramFilterKey as FilterKey,
        filterTypeKey: paramFilterTypeKey as FilterTypeKey,
        borrowKey: 'long' as BorrowKey,
        hideSmallMarkets: paramHideSmallPools === 'true',
        sortBy: paramSortBy as keyof TableLabelsMapper,
        sortByOrder: paramSortByOrder as Order,
        searchText,
      }

      if (paramFilterKey === 'user' && !signerAddress) {
        parsedSearchParams.filterKey = 'all'
        updatePath(parsedSearchParams)
      } else {
        setParsedSearchParams(parsedSearchParams)
        setLoaded(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi, searchParams])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      <StyledAppPageContainer $maxWidth={parsedSearchParams?.filterTypeKey === 'supply' ? '850px' : ''}>
        {rChainId && parsedSearchParams && (
          <MarketList
            rChainId={rChainId}
            isLoaded={loaded}
            isBorrow={parsedSearchParams.filterTypeKey === 'borrow'}
            api={api}
            params={params}
            searchParams={parsedSearchParams}
            filterMapper={FILTER_MAPPER}
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
