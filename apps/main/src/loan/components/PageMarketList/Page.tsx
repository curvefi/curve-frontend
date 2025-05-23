'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import TableStats from '@/loan/components/PageMarketList/components/TableStats'
import CollateralList from '@/loan/components/PageMarketList/index'
import type { SearchParams } from '@/loan/components/PageMarketList/types'
import { DEFAULT_SEARCH_PARAMS } from '@/loan/components/PageMarketList/utils'
import { ROUTE, TITLE } from '@/loan/constants'
import useSearchTermMapper from '@/loan/hooks/useSearchTermMapper'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import Settings from '@/loan/layout/Settings'
import useStore from '@/loan/store/useStore'
import type { CollateralUrlParams, LlamaApi } from '@/loan/types/loan.types'
import { getPath, useChainId } from '@/loan/utils/utilsRouter'
import Box from '@ui/Box'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'

enum SEARCH {
  sortBy = 'sortBy',
  order = 'sortByOrder',
  search = 'search',
}

const Page = (params: CollateralUrlParams) => {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const { connectState, lib: curve = null } = useConnection<LlamaApi>()
  const pageLoaded = !isLoading(connectState)
  const titleMapper = useTitleMapper()
  const searchTermMapper = useSearchTermMapper()
  const rChainId = useChainId(params)
  const { connect: connectWallet, provider } = useWallet()
  const setStateByKey = useStore((state) => state.collateralList.setStateByKey)

  const [loaded, setLoaded] = useState(false)
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS)

  useEffect(() => {
    setStateByKey('initialLoaded', false)
  }, [setStateByKey])

  const onSearch = useCallback(
    (updatedSearchParams: Partial<SearchParams>) => {
      const { searchText, sortBy, sortByOrder } = {
        ...parsedSearchParams,
        ...updatedSearchParams,
      }

      const searchPath = new URLSearchParams(
        [
          [SEARCH.search, searchText ? encodeURIComponent(searchText) : ''],
          [SEARCH.sortBy, sortBy && sortBy !== TITLE.totalBorrowed ? sortBy : ''],
          [SEARCH.order, sortByOrder && sortByOrder !== 'desc' ? sortByOrder : ''],
        ].filter(([, v]) => v),
      ).toString()

      push(getPath(params, `${ROUTE.PAGE_MARKETS}?${searchPath}`))
    },
    [params, parsedSearchParams, push],
  )

  useEffect(() => {
    if (!pageLoaded) return

    const parsedSearchParams = {
      sortBy: searchParams?.get(SEARCH.sortBy) || TITLE.totalBorrowed,
      sortByOrder: searchParams?.get(SEARCH.order) || 'desc',
      searchText: decodeURIComponent(searchParams?.get(SEARCH.search) || ''),
    } as SearchParams

    setParsedSearchParams(parsedSearchParams)
    setLoaded(true)
  }, [pageLoaded, searchParams, setStateByKey])

  return (
    <>
      {provider ? (
        <Container>
          <Content>
            {rChainId && (
              <CollateralList
                rChainId={rChainId}
                params={params}
                curve={curve}
                pageLoaded={loaded}
                searchParams={parsedSearchParams}
                searchTermMapper={searchTermMapper}
                titleMapper={titleMapper}
                onSearch={onSearch}
              />
            )}
          </Content>
          {rChainId && <TableStats />}
        </Container>
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

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;
  padding-top: 0.5rem; // 8px

  @media (min-width: ${breakpoints.sm}rem) {
    margin-top: 2rem;
    padding-left: var(--spacing-narrow);
    padding-right: var(--spacing-narrow);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin-top: 3rem;
  }
`

const Content = styled.div`
  align-content: flex-start;
  display: grid;
  grid-gap: var(--spacing-normal);
  background-color: var(--table--background-color);
  box-shadow: 3px 3px 0 var(--box--primary--shadow-color);
  border: 1px solid var(--box--secondary--border);
  min-height: 288px;
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`

export default Page
