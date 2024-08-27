import type { NextPage } from 'next'
import type { SearchParams } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { DEFAULT_SEARCH_PARAMS } from '@/components/PageMarketList/utils'
import { ROUTE, TITLE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getPath } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils/helpers'
import usePageOnMount from '@/hooks/usePageOnMount'
import useSearchTermMapper from '@/hooks/useSearchTermMapper'
import useStore from '@/store/useStore'
import useTitleMapper from '@/hooks/useTitleMapper'

import DocumentHead from '@/layout/DocumentHead'
import CollateralList from '@/components/PageMarketList/index'
import Settings from '@/layout/Settings'
import TableStats from '@/components/PageMarketList/components/TableStats'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const titleMapper = useTitleMapper()
  const searchTermMapper = useSearchTermMapper()
  const { rChainId } = routerParams

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

    let searchPath = '?'
    if (searchText) searchPath += `${_querySymbol(searchPath)}search=${encodeURIComponent(searchText)}`
    if (sortBy && sortBy !== TITLE.totalBorrowed) searchPath += `${_querySymbol(searchPath)}sortBy=${sortBy}`
    if (sortByOrder && sortByOrder !== 'desc') searchPath += `${_querySymbol(searchPath)}sortByOrder=${sortByOrder}`

    const pathname = getPath(params, `${ROUTE.PAGE_MARKETS}${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    setLoaded(false)

    if (!pageLoaded || isLoadingApi) return

    const parsedSearchParams = {
      sortBy: searchParams.get('sortBy') || TITLE.totalBorrowed,
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

function _querySymbol(searchPath: string) {
  return searchPath === '?' ? '' : '&'
}

export default Page
