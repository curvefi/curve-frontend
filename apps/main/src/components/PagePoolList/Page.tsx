import type { NextPage } from 'next'
import type { FilterKey, Order, PoolListTableLabel, SearchParams, SortKey } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils/responsive'
import { getPoolDatasCached } from '@/store/createPoolListSlice'
import { getPath, parseParams } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils'
import networks from '@/networks'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'

import DocumentHead from '@/layout/default/DocumentHead'
import PoolList from '@/components/PagePoolList/index'
import Settings from '@/layout/default/Settings'

const Page: NextPage<PageProps> = ({ curve, chainId }) => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pageLoaded = usePageOnMount(params, location, navigate)
  const { rChainId } = parseParams(params, location)

  const isLoadingApi = useStore((state) => state.isLoadingApi)
  const isLoadingPools = useStore((state) => state.pools.poolsLoading[rChainId])
  const poolDatas = useStore((state) => state.pools.pools[rChainId])
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const fetchMissingPoolsRewardsApy = useStore((state) => state.pools.fetchMissingPoolsRewardsApy)

  const poolDatasCached = getPoolDatasCached(poolDataMapperCached)
  const poolDatasCachedOrApi = poolDatas ?? poolDatasCached
  const poolDatasLength = (poolDatasCachedOrApi ?? []).length

  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)

  useEffect(() => {
    scrollToTop()
  }, [])

  useEffect(() => {
    if (pageLoaded && !!chainId && !isLoadingApi && !isLoadingPools) {
      fetchMissingPoolsRewardsApy(chainId, poolDatas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, isLoadingPools, isLoadingApi, pageLoaded])

  const TABLE_LABEL: PoolListTableLabel = useMemo(() => {
    return {
      name: { name: t`Pool` },
      rewardsBase: { name: t`Base vAPY`, mobile: t`Rewards Base` },
      rewardsCrv: { name: 'CRV', mobile: t`Rewards CRV` },
      rewardsOther: { name: t`Incentives`, mobile: t`Rewards Incentives` },
      tvl: { name: t`TVL` },
      volume: { name: t`Volume` },
    }
  }, [])

  const updatePath = (updatedSearchParams: Partial<SearchParams>) => {
    const { filterKey, hideSmallPools, searchText, sortBy, sortByOrder } = {
      ...parsedSearchParams,
      ...updatedSearchParams,
    }
    let searchPath = '?'
    if (filterKey && filterKey !== 'all') searchPath += `filter=${filterKey}`
    if (hideSmallPools === false) searchPath += `${searchPath === '?' ? '' : '&'}hideSmallPools=false`
    if (sortBy && sortBy !== 'volume') searchPath += `${searchPath === '?' ? '' : '&'}sortBy=${sortBy}`
    if (sortByOrder && sortByOrder !== 'desc') searchPath += `${searchPath === '?' ? '' : '&'}order=${sortByOrder}`
    if (searchText) searchPath += `${searchPath === '?' ? '' : '&'}search=${encodeURIComponent(searchText)}`
    const pathname = getPath(params, `${ROUTE.PAGE_POOLS}${searchPath}`)
    navigate(pathname)
  }

  useEffect(() => {
    if (rChainId) {
      const paramFilterKey = (searchParams.get('filter') || 'all').toLowerCase()
      const paramSortBy = (searchParams.get('sortBy') || 'volume').toLowerCase()
      const paramOrder = (searchParams.get('order') || 'desc').toLowerCase()
      const paramHideSmallPools = searchParams.get('hideSmallPools') || 'true'
      const searchText = decodeURIComponent(searchParams.get('search') || '')

      // validate filter key
      const foundFilterKey = networks[rChainId].poolFilters.find((f) => f === paramFilterKey)
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
          sortBy: (Object.keys(TABLE_LABEL).find((k) => k.toLowerCase() === paramSortBy) ?? 'volume') as SortKey,
          sortByOrder: (['desc', 'asc'].find((k) => k.toLowerCase() === paramOrder) ?? 'desc') as Order,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TABLE_LABEL, curve?.signerAddress, poolDatasLength, rChainId, searchParams])

  return (
    <>
      <DocumentHead title={t`Pools`} />
      <Container>
        {rChainId && parsedSearchParams && (
          <PoolList
            rChainId={rChainId}
            curve={curve}
            params={params}
            tableLabels={TABLE_LABEL}
            searchParams={parsedSearchParams}
            updatePath={updatePath}
          />
        )}
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

export default Page
