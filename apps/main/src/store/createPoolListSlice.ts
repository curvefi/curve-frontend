import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type {
  FilterKey,
  FormStatus,
  FormValues,
  Order,
  SearchParams,
  SearchTermsResult,
  SortKey,
} from '@/components/PagePoolList/types'
import type { CampaignRewardsMapper } from '@/ui/CampaignRewards/types'
import type { ValueMapperCached } from '@/store/createCacheSlice'

import chunk from 'lodash/chunk'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { SEARCH_TERM } from '@/hooks/useSearchTermMapper'
import { parseSearchTermResults } from '@/components/PagePoolList/utils'
import { groupSearchTerms, searchByText } from '@/shared/curve-lib'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  hideSmallPools: true,
  hideZero: true,
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

type SliceState = {
  activeKey: string
  formValues: FormValues
  formStatus: { [activeKey: string]: FormStatus }
  result: { [activeKey: string]: string[] }
  searchedByTokens: SearchTermsResult
  searchedTerms: string[]
  searchedByAddresses: SearchTermsResult
  showHideSmallPools: boolean
}

type PartialPoolData = Pick<PoolDataCache, 'gauge'> & {
  pool: Pick<Pool, 'id' | 'address' | 'name' | 'isFactory' | 'referenceAsset'>
}

// prettier-ignore
export type PoolListSlice = {
  poolList: SliceState & {
    filterByKey<P extends PartialPoolData>(key: FilterKey, poolDatas: P[], userPoolList: { [p: string]: boolean } | undefined): P[]
    filterBySearchText<P extends PartialPoolData>(searchText: string, poolDatas: P[], highlightResult?: boolean): P[]
    filterSmallTvl<P extends PartialPoolData>(poolDatas: P[], tvlMapper: TvlMapper, chainId: ChainId): P[]
    sortFn<P extends PartialPoolData>(sortKey: SortKey, order: Order, poolDatas: P[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper, tvlMapper: TvlMapper, campaignRewardsMapper: CampaignRewardsMapper): P[]
    setSortAndFilterData(rChainId: ChainId, searchParams: SearchParams, poolDatas: PoolData[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper, tvlMapper: TvlMapper, userPoolList: UserPoolListMapper, campaignRewardsMapper: CampaignRewardsMapper): Promise<void>
    setSortAndFilterCachedData(rChainId: ChainId, searchParams: SearchParams, poolDatasCached: PoolDataCache[], volumeMapperCached: { [poolId:string]: { value: string } }, tvlMapperCached: { [poolId:string]: { value: string } }): void
    setFormValues(rChainId: ChainId, isLite: boolean, searchParams: SearchParams, poolDatas: PoolData[] | undefined, poolDatasCached: PoolDataCache[] | undefined, rewardsApyMapper: RewardsApyMapper | undefined, volumeMapper: VolumeMapper | undefined, volumeMapperCached: ValueMapperCached | undefined, tvlMapper: TvlMapper | undefined, tvlMapperCached: ValueMapperCached | undefined, userPoolList: UserPoolListMapper | undefined, campaignRewardsMapper: CampaignRewardsMapper): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  activeKey: '',
  formValues: DEFAULT_FORM_VALUES,
  formStatus: {},
  result: {},
  searchedByTokens: {},
  searchedTerms: [],
  searchedByAddresses: {},
  showHideSmallPools: false,
}

const sliceKey = 'poolList'

const createPoolListSlice = (set: SetState<State>, get: GetState<State>): PoolListSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterByKey: (key, poolDatas, userPoolList) => {
      if (key === 'user') {
        return poolDatas.filter(({ pool }) => (userPoolList ?? {})[pool.id])
      } else if (key === 'btc' || key === 'crypto' || key === 'eth' || key === 'usd' || key === 'kava') {
        return poolDatas.filter(({ pool }) => pool.referenceAsset.toLowerCase() === key)
      } else if (key === 'crvusd') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-crvusd'))
      } else if (key === 'tricrypto') {
        return poolDatas.filter(
          ({ pool }) => pool.id.startsWith('factory-tricrypto') || pool.id.startsWith('tricrypto'),
        )
      } else if (key === 'stableng') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-stable-ng'))
      } else if (key === 'cross-chain') {
        return poolDatas.filter(
          ({ pool }) =>
            pool.address === '0x939721ce04332ca04b100154e0c8fcbb4ebaf695' ||
            pool.address === '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c' ||
            pool.address === '0x6bb9a6b7066445da6bef268b91810ae750431587' ||
            pool.address === '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2' ||
            pool.address === '0x6e0dc5a4ef555277db3435703f0e287040013763' ||
            pool.name.startsWith('CrossCurve'),
        )
      } else if (key === 'others') {
        return poolDatas.filter(({ pool }) => {
          const referenceAsset = pool.referenceAsset.toLowerCase()
          return (
            referenceAsset === 'link' ||
            referenceAsset === 'eur' ||
            referenceAsset === 'xdai' ||
            referenceAsset === 'other'
          )
        })
      }
      return poolDatas
    },
    filterBySearchText: (searchTerm, poolDatas, highlightResult = true) => {
      const { ...sliceState } = get()[sliceKey]

      // special search case for aUSD₮
      searchTerm = searchTerm.replace(/ausdt/gi, 'aUSD₮')

      const { addressesResult, tokensResult } = searchByText(
        searchTerm,
        poolDatas,
        [SEARCH_TERM['pool.name'], SEARCH_TERM['pool.underlyingCoins']],
        {
          tokens: [SEARCH_TERM['pool.underlyingCoinAddresses']],
          other: [SEARCH_TERM['pool.address'], SEARCH_TERM['pool.gauge.address'], SEARCH_TERM['pool.lpToken']],
        },
      )

      const { tokens: groupedSearchTokens, addresses: groupedSearchAddress } = groupSearchTerms(searchTerm)

      // if highlightResult is false, don't bold the result in UI.
      sliceState.setStateByKeys({
        searchedByTokens: highlightResult ? parseSearchTermResults(tokensResult) : {},
        searchedTerms: highlightResult ? [...groupedSearchTokens, ...groupedSearchAddress] : [],
        searchedByAddresses: highlightResult ? parseSearchTermResults(addressesResult) : {},
      })

      return uniqBy([...tokensResult, ...addressesResult], (r) => r.item.pool.id).map((r) => r.item)
    },
    filterSmallTvl: (poolDatas, tvlMapper, chainId) => {
      const {
        networks: { networks },
      } = get()
      const { hideSmallPoolsTvl } = networks[chainId]
      return poolDatas.filter(({ pool }) => +(tvlMapper?.[pool.id]?.value || '0') > hideSmallPoolsTvl)
    },
    sortFn: (sortKey, order, poolDatas, rewardsApyMapper, tvlMapper, volumeMapper, campaignRewardsMapper) => {
      if (poolDatas.length === 0) {
        return poolDatas
      } else if (sortKey === 'name') {
        return orderBy(poolDatas, ({ pool }) => pool.name.toLowerCase(), [order])
      } else if (sortKey === 'factory') {
        return orderBy(poolDatas, ({ pool }) => pool.isFactory, [order])
      } else if (sortKey === 'referenceAsset') {
        return orderBy(poolDatas, ({ pool }) => pool.referenceAsset.toLowerCase(), [order])
      } else if (sortKey.startsWith('rewards')) {
        return orderBy(
          poolDatas,
          (poolData) => {
            const { pool, gauge } = poolData
            const { base, crv = [], other = [] } = rewardsApyMapper[pool.id] ?? {}
            if (sortKey === 'rewardsBase') {
              return Number(base?.day ?? 0)
            } else if (sortKey === 'rewardsCrv') {
              // Replacing areCrvRewardsStuckInBridge or rewardsNeedNudging CRV with 0
              const showZero = gauge.status?.areCrvRewardsStuckInBridge || gauge.status?.rewardsNeedNudging
              return showZero ? 0 : Number(crv?.[0] ?? 0)
            } else if (sortKey === 'rewardsOther') {
              return other.length > 0 ? other.reduce((total, { apy }) => total + apy, 0) : 0
            }
          },
          [order],
        )
      } else if (sortKey === 'tvl') {
        return orderBy(poolDatas, ({ pool }) => Number(tvlMapper[pool.id]?.value ?? 0), [order])
      } else if (sortKey === 'volume') {
        return orderBy(poolDatas, ({ pool }) => Number(volumeMapper[pool.id]?.value ?? 0), [order])
      } else if (sortKey === 'points') {
        return orderBy(
          poolDatas,
          ({ pool }) => {
            const campaignRewards = campaignRewardsMapper[pool.address.toLowerCase()]
            if (campaignRewards && campaignRewards.length > 0) {
              // Pools with campaign rewards get a high priority value
              return Number(campaignRewards[0].multiplier)
            } else {
              // Pools without campaign rewards maintain their original order
              return 0
            }
          },
          [order],
        )
      }
      return poolDatas
    },
    setSortAndFilterData: async (
      rChainId,
      searchParams,
      poolDatas,
      rewardsApyMapper,
      volumeMapper,
      tvlMapper,
      userPoolList,
      campaignRewardsMapper,
    ) => {
      const {
        pools,
        [sliceKey]: { activeKey, formStatus, result: storedResults, ...sliceState },
      } = get()
      const { hideSmallPools, searchText, filterKey, sortBy, sortByOrder } = searchParams

      let tablePoolDatas: PoolData[] = [...poolDatas]

      if (filterKey !== 'user' && hideSmallPools && poolDatas.length > 10) {
        tablePoolDatas = sliceState.filterSmallTvl(tablePoolDatas, tvlMapper, rChainId)
      }

      // filter by 'all | usd | btc | etch...'
      if (filterKey) {
        if (
          filterKey === 'all' ||
          filterKey === 'crypto' ||
          filterKey === 'tricrypto' ||
          filterKey === 'others' ||
          filterKey === 'stableng' ||
          filterKey === 'user' ||
          filterKey === 'cross-chain'
        ) {
          tablePoolDatas = sliceState.filterByKey(filterKey, tablePoolDatas, userPoolList)
        } else {
          tablePoolDatas = sliceState.filterBySearchText(filterKey, tablePoolDatas, false)
        }
      }

      if (searchText) {
        tablePoolDatas = sliceState.filterBySearchText(searchText, tablePoolDatas)
      }

      // sort by table labels 'pool | factory | type | rewards...'
      if (sortBy) {
        if (sortBy.startsWith('rewards')) await pools.fetchMissingPoolsRewardsApy(rChainId, tablePoolDatas)
        tablePoolDatas = sliceState.sortFn(
          sortBy,
          sortByOrder,
          tablePoolDatas,
          rewardsApyMapper,
          tvlMapper,
          volumeMapper,
          campaignRewardsMapper,
        )
      }

      // set result
      const result = tablePoolDatas.map(({ pool }) => pool.id)
      sliceState.setStateByActiveKey('result', activeKey, result)

      sliceState.setStateByActiveKey('formStatus', activeKey, {
        ...(formStatus[activeKey] ?? DEFAULT_FORM_STATUS),
        noResult: result.length === 0,
        isLoading: false,
      })

      // get rest of pool list data
      Promise.all([pools.fetchMissingPoolsRewardsApy(rChainId, tablePoolDatas)])
    },

    // use local storage data till actual data returns
    setSortAndFilterCachedData: (rChainId, searchParams, poolDatasCached, volumeMapperCached, tvlMapperCached) => {
      let { activeKey, formStatus, ...sliceState } = get()[sliceKey]

      const { sortBy, sortByOrder } = searchParams

      const haveVolumeCachedMapper = sortBy === 'volume' && Object.keys(volumeMapperCached ?? {}).length > 0
      const haveTvlCachedMapper = sortBy === 'tvl' && Object.keys(tvlMapperCached ?? {}).length > 0

      let poolList: PoolDataCache[] = []

      if (haveVolumeCachedMapper || haveTvlCachedMapper) {
        poolList = [...poolDatasCached]

        if (haveTvlCachedMapper) {
          poolList = orderBy(poolList, ({ pool }) => Number(tvlMapperCached[pool.id]?.value ?? 0), [sortByOrder])
        } else if (haveVolumeCachedMapper) {
          poolList = orderBy(poolList, ({ pool }) => Number(volumeMapperCached[pool.id]?.value ?? 0), [sortByOrder])
        }
      }

      // set result
      const result = poolList.map(({ pool }) => pool.id)
      sliceState.setStateByActiveKey('result', activeKey, result)

      sliceState.setStateByActiveKey('formStatus', activeKey, {
        ...(formStatus[activeKey] ?? DEFAULT_FORM_STATUS),
        noResult: result.length === 0,
        isLoading: true,
      })
    },
    setFormValues: async (
      rChainId,
      isLite,
      searchParams,
      poolDatas,
      poolDatasCached = [],
      rewardsApyMapper = {},
      volumeMapper = {},
      volumeMapperCached = {},
      tvlMapper = {},
      tvlMapperCached = {},
      userPoolList = {},
      campaignRewardsMapper,
    ) => {
      const state = get()
      let { formValues, result: storedResults, ...sliceState } = state[sliceKey]

      const activeKey = getPoolListActiveKey(rChainId, searchParams)

      sliceState.setStateByActiveKey('formStatus', activeKey, {
        ...DEFAULT_FORM_STATUS,
        isLoading: typeof storedResults[activeKey] === 'undefined',
      })

      const { hideSmallPools, searchText, filterKey, sortBy, sortByOrder } = searchParams

      const isDefaultSearchParams =
        hideSmallPools &&
        searchText === '' &&
        filterKey === 'all' &&
        sortBy === (isLite ? 'tvl' : 'volume') &&
        sortByOrder === 'desc'

      // update form values
      formValues = {
        ...formValues,
        hideSmallPools,
        searchTextByTokensAndAddresses: {},
        searchTextByOther: {},
      }
      sliceState.setStateByKeys({
        activeKey,
        formValues,
        searchedByAddresses: {},
        searchedTerms: [],
        searchedByTokens: {},
      })

      const havePoolDatas = typeof poolDatas !== 'undefined' && Object.keys(poolDatas).length >= 0

      if (havePoolDatas) {
        if (poolDatas.length === 0) {
          // network have no pools
          sliceState.setStateByKey('result', { [activeKey]: [] })
          sliceState.setStateByActiveKey('formStatus', activeKey, {
            ...DEFAULT_FORM_STATUS,
            isLoading: false,
            noResult: true,
          })
          return
        }

        sliceState.setSortAndFilterData(
          rChainId,
          searchParams,
          poolDatas,
          rewardsApyMapper,
          volumeMapper,
          tvlMapper,
          userPoolList,
          campaignRewardsMapper,
        )
        return
      }

      if (!havePoolDatas && isDefaultSearchParams && poolDatasCached.length > 0) {
        sliceState.setSortAndFilterCachedData(
          rChainId,
          searchParams,
          poolDatasCached,
          volumeMapperCached,
          tvlMapperCached,
        )
        return
      }

      // set loading
      sliceState.setStateByActiveKey('formStatus', activeKey, { ...DEFAULT_FORM_STATUS })
    },

    // slice helpers
    setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
      if (Object.keys(get()[sliceKey][key]).length > 30) {
        get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
      } else {
        get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
      }
    },
    setStateByKey: <T>(key: StateKey, value: T) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState: Partial<SliceState>) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, { ...DEFAULT_STATE })
    },
  },
})

export function getPoolListActiveKey(chainId: ChainId, searchParams: SearchParams) {
  const { filterKey, hideSmallPools, searchText, sortBy, sortByOrder } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${filterKey}-${hideSmallPools}-${sortBy}-${sortByOrder}-${parsedSearchText}`
}

export default createPoolListSlice
