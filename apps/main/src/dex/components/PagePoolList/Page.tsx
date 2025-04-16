'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import PoolList from '@/dex/components/PagePoolList/index'
import type { FilterKey, Order, PoolListTableLabel, SearchParams, SortKey } from '@/dex/components/PagePoolList/types'
import { ROUTE } from '@/dex/constants'
import { usePageProps } from '@/dex/hooks/usePageProps'
import useSearchTermMapper from '@/dex/hooks/useSearchTermMapper'
import Settings from '@/dex/layout/default/Settings'
import useStore from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { breakpoints } from '@ui/utils/responsive'
import { t } from '@ui-kit/lib/i18n'

enum SEARCH {
  filter = 'filter',
  sortBy = 'sortBy',
  order = 'order',
  search = 'search',
}

type PageProps = NetworkUrlParams

const Page = (params: PageProps) => {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const { routerParams, curve } = usePageProps()
  const searchTermMapper = useSearchTermMapper()
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)
  const { rChainId } = routerParams

  const poolDataMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const network = useStore((state) => state.networks.networks[rChainId])
  const { isLite } = network
  const poolDatasLength = Object.keys(poolDataMapper ?? poolDataMapperCached ?? {}).length
  const defaultSortBy = isLite ? 'tvl' : 'volume'

  const TABLE_LABEL: PoolListTableLabel = useMemo(
    () => ({
      name: { name: t`Pool` },
      ...(isLite
        ? { rewardsLite: { name: t`Rewards`, mobile: t`Rewards` } }
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
      const { filterKey, searchText, sortBy, sortByOrder } = {
        ...parsedSearchParams,
        ...updatedSearchParams,
      }
      const searchPath = new URLSearchParams(
        [
          [SEARCH.filter, filterKey && filterKey !== 'all' ? filterKey : ''],
          [SEARCH.sortBy, sortBy && sortBy !== defaultSortBy ? sortBy : ''],
          [SEARCH.order, sortByOrder && sortByOrder !== 'desc' ? sortByOrder : ''],
          [SEARCH.search, searchText ? encodeURIComponent(searchText) : ''],
        ].filter(([, v]) => v),
      ).toString()

      const pathname = getPath(params, `${ROUTE.PAGE_POOLS}?${searchPath}`)
      push(pathname)
    },
    [defaultSortBy, push, params, parsedSearchParams],
  )

  useEffect(() => {
    if (rChainId) {
      const paramFilterKey = (searchParams?.get(SEARCH.filter) || 'all').toLowerCase()
      const paramSortBy = (searchParams?.get(SEARCH.sortBy) || defaultSortBy).toLowerCase()
      const paramOrder = (searchParams?.get(SEARCH.order) || 'desc').toLowerCase()
      const searchText = decodeURIComponent(searchParams?.get(SEARCH.search) || '')

      // validate filter key
      const foundFilterKey = network.poolFilters.find((f) => f === paramFilterKey)
      if ((paramFilterKey === 'user' && !!curve && !curve?.signerAddress) || !foundFilterKey) {
        updatePath({
          filterKey: 'all',
          sortBy: paramSortBy as SortKey,
          sortByOrder: paramOrder as Order,
          searchText: searchText,
        })
      } else {
        setParsedSearchParams({
          filterKey: paramFilterKey as FilterKey,
          searchText,
          sortBy: (Object.keys(TABLE_LABEL).find((k) => k.toLowerCase() === paramSortBy) ?? defaultSortBy) as SortKey,
          sortByOrder: (['desc', 'asc'].find((k) => k.toLowerCase() === paramOrder) ?? 'desc') as Order,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.signerAddress, poolDatasLength, rChainId, searchParams, defaultSortBy, network])

  return (
    <>
      <Container $isLite={isLite}>
        {rChainId && parsedSearchParams && (
          <PoolList
            rChainId={rChainId}
            curve={curve}
            params={params}
            isLite={isLite}
            tableLabels={TABLE_LABEL}
            searchParams={parsedSearchParams}
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
