import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { PoolList } from '@/dex/components/PagePoolList/index'
import { PoolListPage } from '@/dex/components/PagePoolList/PoolListPage'
import type { FilterKey, Order, PoolListTableLabel, SearchParams, SortKey } from '@/dex/components/PagePoolList/types'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { useSearchTermMapper } from '@/dex/hooks/useSearchTermMapper'
import { useStore } from '@/dex/store/useStore'
import { breakpoints } from '@ui/utils/responsive'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { useDexMarketList } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'

enum SEARCH {
  filter = 'filter',
  sortBy = 'sortBy',
  order = 'order',
  search = 'search',
}

const OldPoolListPage = () => {
  const push = useNavigate()
  const searchParams = useSearchParams()
  const { curveApi = null } = useCurve()
  const searchTermMapper = useSearchTermMapper()
  const [parsedSearchParams, setParsedSearchParams] = useState<SearchParams | null>(null)
  const { chainId: rChainId } = useNetworkFromUrl()!

  const poolDataMapper = useStore((state) => state.pools.poolsMapper[rChainId])
  const poolDataMapperCached = useStore((state) => state.storeCache.poolsMapper[rChainId])
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const { isLite, poolFilters } = network
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
      push(
        `?${new URLSearchParams(
          [
            [SEARCH.filter, filterKey && filterKey !== 'all' ? filterKey : ''],
            [SEARCH.sortBy, sortBy && sortBy !== defaultSortBy ? sortBy : ''],
            [SEARCH.order, sortByOrder && sortByOrder !== 'desc' ? sortByOrder : ''],
            [SEARCH.search, searchText ? encodeURIComponent(searchText) : ''],
          ].filter(([, v]) => v),
        )}`,
      )
    },
    [defaultSortBy, push, parsedSearchParams],
  )

  useEffect(() => {
    if (rChainId) {
      const paramFilterKey = (searchParams?.get(SEARCH.filter) || 'all').toLowerCase()
      const paramSortBy = (searchParams?.get(SEARCH.sortBy) || defaultSortBy).toLowerCase()
      const paramOrder = (searchParams?.get(SEARCH.order) || 'desc').toLowerCase()
      const searchText = decodeURIComponent(searchParams?.get(SEARCH.search) || '')

      // validate filter key
      const foundFilterKey = poolFilters.find((f) => f === paramFilterKey)
      if ((paramFilterKey === 'user' && !!curveApi && !curveApi?.signerAddress) || !foundFilterKey) {
        updatePath({
          filterKey: 'all',
          sortBy: paramSortBy as SortKey,
          sortByOrder: paramOrder as Order,
          searchText,
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
  }, [curveApi?.signerAddress, poolDatasLength, rChainId, searchParams, defaultSortBy, poolFilters])

  return (
    <Container $isLite={isLite}>
      {rChainId && parsedSearchParams && (
        <PoolList
          rChainId={rChainId}
          curve={curveApi}
          isLite={isLite}
          tableLabels={TABLE_LABEL}
          searchParams={parsedSearchParams}
          searchTermMapper={searchTermMapper}
          updatePath={updatePath}
        />
      )}
    </Container>
  )
}

const Container = styled.div<{ $isLite: boolean }>`
  margin: 0 auto;
  max-width: ${({ $isLite }) => ($isLite ? '870px' : `var(--width)`)};
  min-height: 50vh;
  background-color: var(--table--background-color);
  border: 1px solid var(--box--secondary--border);

  th {
    background-color: var(--table_head--background-color);
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem auto;
  }
`

export const PagePoolList = () => (useDexMarketList() ? <PoolListPage /> : <OldPoolListPage />)
