import type { NextPage } from 'next'
import type { SearchParams } from '@/loan/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { DEFAULT_SEARCH_PARAMS } from '@/loan/components/PageMarketList/utils'
import { ROUTE, TITLE } from '@/loan/constants'
import { breakpoints } from '@ui/utils/responsive'
import { getPath } from '@/loan/utils/utilsRouter'
import { scrollToTop } from '@/loan/utils/helpers'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import useSearchTermMapper from '@/loan/hooks/useSearchTermMapper'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import useStore from '@/loan/store/useStore'

import DocumentHead from '@/loan/layout/DocumentHead'
import CollateralList from '@/loan/components/PageMarketList/index'
import Settings from '@/loan/layout/Settings'
import TableStats from '@/loan/components/PageMarketList/components/TableStats'
import ConnectWallet from '@/loan/components/ConnectWallet'
import Box from '@ui/Box'

enum SEARCH {
  sortBy = 'sortBy',
  order = 'sortByOrder',
  search = 'search',
}

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const searchTermMapper = useSearchTermMapper()
  const { rChainId } = routerParams
  const provider = useStore((state) => state.wallet.getProvider(''))

  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const setStateByKey = useStore((state) => state.collateralList.setStateByKey)

  const [loaded, setLoaded] = useState(false)
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS)

  useEffect(() => {
    scrollToTop()
    setStateByKey('initialLoaded', false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updatePath = (updatedSearchParams: Partial<SearchParams>) => {
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

    const pathname = getPath(params, `${ROUTE.PAGE_MARKETS}?${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    setLoaded(false)

    if (!pageLoaded || isLoadingApi) return

    const parsedSearchParams = {
      sortBy: searchParams.get(SEARCH.sortBy) || TITLE.totalBorrowed,
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
                updatePath={updatePath}
              />
            )}
          </Content>
          {rChainId && <TableStats />}
        </Container>
      ) : (
        <Box display="flex" fillWidth>
          <ConnectWalletWrapper>
            <ConnectWallet
              description="Connect wallet to view markets list"
              connectText="Connect Wallet"
              loadingText="Connecting"
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
