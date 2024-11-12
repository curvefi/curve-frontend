import type { NextPage } from 'next'
import type { FilterKey, Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getPath } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils'
import usePageOnMount from '@/hooks/usePageOnMount'
import useSearchTermMapper from '@/hooks/useSearchTermMapper'
import useStore from '@/store/useStore'
import DocumentHead from '@/layout/default/DocumentHead'
import PoolList from '@/components/PagePoolList/index'
import Settings from '@/layout/default/Settings'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { routerParams, curve } = usePageOnMount(params, location, navigate)
  const searchTermMapper = useSearchTermMapper()
  const { rChainId } = routerParams

  const poolDataMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])

  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)

  const network = useStore((state) => state.networks.networks[rChainId])
  const { isLite } = network
  const poolDatasLength = Object.keys(poolDataMapper ?? poolDataMapperCached ?? {}).length
  const defaultSortBy = isLite ? 'tvl' : 'volume'

  useEffect(() => {
    scrollToTop()
  }, [])

  const TABLE_LABEL: PoolListTableLabel = useMemo(
    () => ({
      name: { name: t`Pool` },
      ...(isLite
        ? { rewardsOtherLite: { name: t`Rewards`, mobile: t`Rewards` } }
        : {
            rewardsBase: { name: t`Base vAPY`, mobile: t`Rewards Base` },
            rewardsCrv: { name: 'CRV', mobile: t`Rewards CRV` },
            rewardsOther: { name: t`Incentives`, mobile: t`Rewards Incentives` },
          }),
      tvl: { name: t`TVL` },
      volume: { name: t`Volume` },
      points: { name: t`Points` },
    }),
    [isLite],
  )

  const updatePath = useCallback(
    (updatedSearchParams: Partial<SearchParams>) => {
      const { filterKey, hideSmallPools, searchText, sortBy, sortByOrder } = {
        ...parsedSearchParams,
        ...updatedSearchParams,
      }
      let searchPath = '?'

      if (filterKey && filterKey !== 'all' && !('filterKey' in updatedSearchParams)) {
        searchPath += `filter=${filterKey}`
      }
      if (hideSmallPools === false && !('hideSmallPools' in updatedSearchParams)) {
        searchPath += `${searchPath === '?' ? '' : '&'}hideSmallPools=false`
      }
      if (sortBy && sortBy !== defaultSortBy && !('sortBy' in updatedSearchParams)) {
        searchPath += `${searchPath === '?' ? '' : '&'}sortBy=${sortBy}`
      }
      if (sortByOrder && sortByOrder !== 'desc' && !('sortByOrder' in updatedSearchParams)) {
        searchPath += `${searchPath === '?' ? '' : '&'}order=${sortByOrder}`
      }
      if (searchText && !('searchText' in updatedSearchParams)) {
        searchPath += `${searchPath === '?' ? '' : '&'}search=${encodeURIComponent(searchText)}`
      }

      Object.entries(updatedSearchParams).forEach(([k, v]) => {
        if (k === 'filterKey') searchPath += `filter=${v}`
        if (k === 'hideSmallPools') searchPath += `${searchPath === '?' ? '' : '&'}hideSmallPools=${v}`
        if (k === 'sortBy') searchPath += `${searchPath === '?' ? '' : '&'}sortBy=${v}`
        if (k === 'sortByOrder') searchPath += `${searchPath === '?' ? '' : '&'}order=${v}`
        if (k === 'searchText' && !!v) searchPath += `${searchPath === '?' ? '' : '&'}search=${encodeURIComponent(v)}`
      })
      const pathname = getPath(params, `${ROUTE.PAGE_POOLS}${searchPath}`)
      navigate(pathname)
    },
    [defaultSortBy, navigate, params, parsedSearchParams],
  )

  useEffect(() => {
    if (rChainId) {
      const paramFilterKey = (searchParams.get('filter') || 'all').toLowerCase()
      const paramSortBy = (searchParams.get('sortBy') || defaultSortBy).toLowerCase()
      const paramOrder = (searchParams.get('order') || 'desc').toLowerCase()
      const paramHideSmallPools = searchParams.get('hideSmallPools') || 'true'
      const searchText = decodeURIComponent(searchParams.get('search') || '')

      // validate filter key
      const foundFilterKey = network.poolFilters.find((f) => f === paramFilterKey)
      if ((paramFilterKey === 'user' && !!curve && !curve?.signerAddress) || !foundFilterKey) {
        updatePath({
          filterKey: 'all',
          hideSmallPools: paramHideSmallPools === 'true',
          sortBy: paramSortBy as SortKey,
          sortByOrder: paramOrder as Order,
          searchText: searchText,
        })
      } else {
        setParsedSearchParams({
          filterKey: paramFilterKey as FilterKey,
          hideSmallPools: paramHideSmallPools === 'true',
          searchText,
          sortBy: (Object.keys(TABLE_LABEL).find((k) => k.toLowerCase() === paramSortBy) ?? defaultSortBy) as SortKey,
          sortByOrder: (['desc', 'asc'].find((k) => k.toLowerCase() === paramOrder) ?? 'desc') as Order,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress, poolDatasLength, rChainId, searchParams, defaultSortBy, network])

  const sortSearchTextLast = useMemo(() => {
    const searchParamsOrder: { key: string; value: string }[] = []
    searchParams.forEach((value, key) => {
      searchParamsOrder.push({ key, value })
    })
    const searchTextIdx = searchParamsOrder.findIndex((s) => s.key === 'search')
    const sortByIdx = searchParamsOrder.findIndex((s) => s.key === 'sortBy')
    return searchTextIdx !== -1 && searchTextIdx > sortByIdx
  }, [searchParams])

  return (
    <>
      <DocumentHead title={t`Pools`} />
      <Container $isLite={isLite}>
        {rChainId && parsedSearchParams && (
          <PoolList
            rChainId={rChainId}
            curve={curve}
            params={params}
            isLite={isLite}
            tableLabels={TABLE_LABEL}
            searchParams={parsedSearchParams}
            sortSearchTextLast={sortSearchTextLast}
            searchTermMapper={searchTermMapper}
            updatePath={updatePath}
          />
        )}
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div<{ $isLite: boolean }>`
  margin: 0 auto;
  max-width: ${({ $isLite }) => ($isLite ? '870px' : `var(--width)`)};
  min-height: 50vh;
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem auto;
  }
`

export default Page
