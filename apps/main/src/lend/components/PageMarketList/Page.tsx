'use client'
import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import MarketList from '@/lend/components/PageMarketList/index'
import type { FilterListProps, SearchParams } from '@/lend/components/PageMarketList/types'
import { ROUTE } from '@/lend/constants'
import useSearchTermMapper from '@/lend/hooks/useSearchTermMapper'
import useTitleMapper from '@/lend/hooks/useTitleMapper'
import Settings from '@/lend/layout/Settings'
import { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { NetworkUrlParams } from '@/lend/types/lend.types'
import { getPath } from '@/lend/utils/utilsRouter'
import { AppPageContainer } from '@ui/AppPage'
import Box from '@ui/Box'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

enum SEARCH {
  filter = 'filter',
  hideSmallMarkets = 'hideSmallMarkets',
  sortBy = 'sortBy',
  order = 'order',
  search = 'search',
  type = 'type',
}

const Page = (params: NetworkUrlParams) => {
  const { provider, connect } = useWallet()
  const [loaded, setLoaded] = useState(false)
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)
  const push = useNavigate()
  const searchParams = useSearchParams()
  const { llamaApi: api = null, connectState } = useConnection()
  const searchTermMapper = useSearchTermMapper()
  const titleMapper = useTitleMapper()

  const isLoadingApi = isLoading(connectState)
  const rChainId = networksIdMapper[params.network]
  const { signerAddress } = api ?? {}

  const setStateByKey = useStore((state) => state.marketList.setStateByKey)

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
    setStateByKey('initialLoaded', false)
  }, [setStateByKey])

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

    push(getPath(params, `${ROUTE.PAGE_MARKETS}?${searchPath}`))
  }

  useEffect(() => {
    if (isLoadingApi) {
      setLoaded(false)
      return
    }

    setParsedSearchParams({
      filterKey: searchParams?.get(SEARCH.filter) || 'all',
      filterTypeKey: searchParams?.get(SEARCH.type) || 'borrow',
      hideSmallMarkets: searchParams?.get(SEARCH.hideSmallMarkets) !== 'false',
      sortBy: searchParams?.get(SEARCH.sortBy) || '',
      sortByOrder: searchParams?.get(SEARCH.order) || 'desc',
      searchText: decodeURIComponent(searchParams?.get(SEARCH.search) || ''),
    } as SearchParams)
    setLoaded(true)
  }, [isLoadingApi, searchParams, setStateByKey])

  return (
    <>
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
              connectWallet={() => connect()}
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
