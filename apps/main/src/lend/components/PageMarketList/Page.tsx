import type { NextPage } from 'next'
import type { FilterListProps, SearchParams } from '@lend/components/PageMarketList/types'

import { t } from '@lingui/macro'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { ROUTE } from '@lend/constants'
import { getPath } from '@lend/utils/utilsRouter'
import { scrollToTop } from '@lend/utils/helpers'
import usePageOnMount from '@lend/hooks/usePageOnMount'
import useSearchTermMapper from '@lend/hooks/useSearchTermMapper'
import useStore from '@lend/store/useStore'
import useTitleMapper from '@lend/hooks/useTitleMapper'

import { AppPageContainer } from '@ui/AppPage'
import DocumentHead from '@lend/layout/DocumentHead'
import MarketList from '@lend/components/PageMarketList/index'
import Settings from '@lend/layout/Settings'
import { ConnectWalletPrompt, useWalletStore } from '@ui-kit/features/connect-wallet'
import Box from '@ui/Box'
import { isLoading } from '@ui/utils'

enum SEARCH {
  filter = 'filter',
  hideSmallMarkets = 'hideSmallMarkets',
  sortBy = 'sortBy',
  order = 'order',
  search = 'search',
  type = 'type',
}

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams, api } = usePageOnMount(params, location, navigate)
  const searchTermMapper = useSearchTermMapper()
  const titleMapper = useTitleMapper()
  const { rChainId } = routerParams

  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const setStateByKey = useStore((state) => state.marketList.setStateByKey)
  const provider = useWalletStore((s) => s.provider)
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
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

    const searchPath = new URLSearchParams(
      [
        [SEARCH.search, searchText ? encodeURIComponent(searchText) : ''],
        [SEARCH.filter, filterKey && filterKey !== 'all' ? filterKey : ''],
        [SEARCH.type, filterTypeKey && filterTypeKey !== 'borrow' ? filterTypeKey : ''],
        [SEARCH.hideSmallMarkets, hideSmallMarkets === false ? 'false' : ''],
        [SEARCH.sortBy, sortBy ?? ''],
        [SEARCH.order, sortByOrder && sortByOrder !== 'desc' ? sortByOrder : ''],
      ].filter(([, v]) => v),
    ).toString()

    const pathname = getPath(params, `${ROUTE.PAGE_MARKETS}?${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    setLoaded(false)

    if (!pageLoaded || isLoadingApi) return

    const hideSmallMarkets = searchParams.get(SEARCH.hideSmallMarkets) || 'true'

    const parsedSearchParams = {
      filterKey: searchParams.get(SEARCH.filter) || 'all',
      filterTypeKey: searchParams.get(SEARCH.type) || 'borrow',
      hideSmallMarkets: hideSmallMarkets === 'true',
      sortBy: searchParams.get(SEARCH.sortBy) || '',
      sortByOrder: searchParams.get(SEARCH.order) || 'desc',
      searchText: decodeURIComponent(searchParams.get(SEARCH.search) || ''),
    } as SearchParams

    setStateByKey('searchParams', parsedSearchParams)
    setParsedSearchParams(parsedSearchParams)
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded, isLoadingApi, searchParams])

  return (
    <>
      <DocumentHead title={t`Markets`} />
      {provider ? (
        <StyledAppPageContainer $maxWidth={parsedSearchParams?.filterTypeKey === 'supply' ? '990px' : ''}>
          {rChainId && parsedSearchParams && (
            <MarketList
              rChainId={rChainId}
              isLoaded={loaded}
              api={api}
              filterList={filterList}
              filterTypeMapper={FILTER_TYPE_MAPPER}
              searchParams={parsedSearchParams}
              searchTermMapper={searchTermMapper}
              titleMapper={titleMapper}
              updatePath={updatePath}
            />
          )}
        </StyledAppPageContainer>
      ) : (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWalletPrompt
              description="Connect wallet to view markets list"
              connectText="Connect Wallet"
              loadingText="Connecting"
              connectWallet={() => connectWallet()}
              isLoading={isLoading(connectState)}
            />
          </ConnectWalletWrapper>
        </Box>
      )}
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

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`

export default Page
