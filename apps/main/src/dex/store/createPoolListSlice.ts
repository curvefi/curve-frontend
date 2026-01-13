import lodash from 'lodash'
import type { StoreApi } from 'zustand'
import type {
  FilterKey,
  FormStatus,
  FormValues,
  Order,
  SearchParams,
  SearchTermsResult,
  SortKey,
} from '@/dex/components/PagePoolList/types'
import { parseSearchTermResults } from '@/dex/components/PagePoolList/utils'
import { CROSS_CHAIN_ADDRESSES } from '@/dex/constants'
import { SEARCH_TERM } from '@/dex/hooks/useSearchTermMapper'
import type { State } from '@/dex/store/useStore'
import {
  ChainId,
  Pool,
  PoolData,
  PoolDataCache,
  RewardsApyMapper,
  TvlMapper,
  UserPoolListMapper,
  type ValueMapperCached,
  VolumeMapper,
} from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import { combineCampaigns } from '@ui-kit/entities/campaigns'
import { getCampaignsExternal } from '@ui-kit/entities/campaigns/campaigns-external'
import { getCampaignsMerkl } from '@ui-kit/entities/campaigns/campaigns-merkl'
import { MIN_POOLS_DISPLAYED } from '@ui-kit/features/user-profile/store'
import { groupSearchTerms, searchByText, takeTopWithMin } from '@ui-kit/utils'
import { fetchNetworks, getNetworks } from '../entities/networks'

type StateKey = keyof typeof DEFAULT_STATE
const { orderBy, uniqBy, chunk } = lodash

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
    filterSmallTvl<P extends PartialPoolData>(poolDatas: P[], tvlMapper: TvlMapper | ValueMapperCached, chainId: ChainId): P[]
    sortFn<P extends PartialPoolData>(sortKey: SortKey, order: Order, poolDatas: P[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper | ValueMapperCached, tvlMapper: TvlMapper | ValueMapperCached, isCrvRewardsEnabled: boolean, chainId: ChainId): P[]
    setSortAndFilterData(rChainId: ChainId, searchParams: SearchParams, hideSmallPools: boolean, poolDatas: PoolData[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper | ValueMapperCached, tvlMapper: TvlMapper | ValueMapperCached, userPoolList: UserPoolListMapper): Promise<void>
    setSortAndFilterCachedData(rChainId: ChainId, searchParams: SearchParams, poolDatasCached: PoolDataCache[], volumeMapperCached: { [poolId:string]: { value: string } }, tvlMapperCached: { [poolId:string]: { value: string } }): void
    setFormValues(rChainId: ChainId, isLite: boolean, searchParams: SearchParams, hideSmallPools: boolean, poolDatas: PoolData[] | undefined, poolDatasCached: PoolDataCache[] | undefined, rewardsApyMapper: RewardsApyMapper | undefined, volumeMapper: VolumeMapper | undefined, volumeMapperCached: ValueMapperCached | undefined, tvlMapper: TvlMapper | undefined, tvlMapperCached: ValueMapperCached | undefined, userPoolList: UserPoolListMapper | undefined): void

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

const createPoolListSlice = (_set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): PoolListSlice => ({
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
          ({ pool }) => CROSS_CHAIN_ADDRESSES.includes(pool.address) || pool.name.startsWith('CrossCurve'),
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
      const networks = getNetworks()
      const { hideSmallPoolsTvl } = networks[chainId]
      return takeTopWithMin(
        poolDatas,
        (pd) => +(tvlMapper?.[pd.pool.id]?.value || '0'),
        hideSmallPoolsTvl,
        MIN_POOLS_DISPLAYED,
      )
    },
    sortFn: (sortKey, order, poolDatas, rewardsApyMapper, tvlMapper, volumeMapper, isCrvRewardsEnabled, chainId) => {
      const networks = getNetworks()

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
            } else if (sortKey === 'rewardsCrv' || (sortKey === 'rewardsLite' && isCrvRewardsEnabled)) {
              // Replacing areCrvRewardsStuckInBridge or rewardsNeedNudging CRV with 0
              const showZero = gauge.status?.areCrvRewardsStuckInBridge || gauge.status?.rewardsNeedNudging
              return showZero ? 0 : Number(crv?.[0] ?? 0)
            } else if (sortKey === 'rewardsOther' || sortKey === 'rewardsLite') {
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
        const blockchainId = networks[chainId].networkId as Chain
        return orderBy(
          poolDatas,
          ({ pool }) => {
            const campaigns = combineCampaigns(getCampaignsExternal({}), getCampaignsMerkl({}), blockchainId)
            const rewards = campaigns[pool.address.toLowerCase()] ?? []

            return Math.max(
              0,
              ...rewards.map((x) => (x.multiplier && typeof x.multiplier === 'number' ? x.multiplier : 0)),
            )
          },
          [order],
        )
      }
      return poolDatas
    },
    setSortAndFilterData: async (
      rChainId,
      searchParams,
      hideSmallPools,
      poolDatas,
      rewardsApyMapper,
      volumeMapper,
      tvlMapper,
      userPoolList,
    ) => {
      const {
        pools,
        [sliceKey]: { activeKey, formStatus, result: storedResults, ...sliceState },
      } = get()
      const networks = await fetchNetworks()
      const { isCrvRewardsEnabled } = networks?.[rChainId] ?? {}

      const { searchText, filterKey, sortBy, sortByOrder } = searchParams

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
          isCrvRewardsEnabled,
          rChainId,
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
      void Promise.all([pools.fetchMissingPoolsRewardsApy(rChainId, tablePoolDatas)])
    },

    // use local storage data till actual data returns
    setSortAndFilterCachedData: (rChainId, searchParams, poolDatasCached, volumeMapperCached, tvlMapperCached) => {
      const { filterSmallTvl, activeKey, formStatus, ...sliceState } = get()[sliceKey]

      const { sortBy, sortByOrder } = searchParams

      const haveVolumeCachedMapper = sortBy === 'volume' && Object.keys(volumeMapperCached ?? {}).length > 0
      const haveTvlCachedMapper = sortBy === 'tvl' && Object.keys(tvlMapperCached ?? {}).length > 0

      let poolList: PoolDataCache[] = []

      if (haveVolumeCachedMapper || haveTvlCachedMapper) {
        poolList = filterSmallTvl(poolDatasCached, tvlMapperCached, rChainId)

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
      hideSmallPools,
      poolDatas,
      poolDatasCached = [],
      rewardsApyMapper = {},
      volumeMapper = {},
      volumeMapperCached = {},
      tvlMapper = {},
      tvlMapperCached = {},
      userPoolList = {},
    ) => {
      const state = get()
      const { formValues, result: storedResults, ...sliceState } = state[sliceKey]

      const activeKey = getPoolListActiveKey(rChainId, searchParams)

      sliceState.setStateByActiveKey('formStatus', activeKey, {
        ...DEFAULT_FORM_STATUS,
        isLoading: typeof storedResults[activeKey] === 'undefined',
      })

      const { searchText, filterKey, sortBy, sortByOrder } = searchParams

      const isDefaultSearchParams =
        searchText === '' && filterKey === 'all' && sortBy === (isLite ? 'tvl' : 'volume') && sortByOrder === 'desc'

      // update form values
      sliceState.setStateByKeys({
        activeKey,
        formValues: {
          ...formValues,
          searchTextByTokensAndAddresses: {},
          searchTextByOther: {},
        },
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

        void sliceState.setSortAndFilterData(
          rChainId,
          searchParams,
          hideSmallPools,
          poolDatas,
          rewardsApyMapper,
          Object.keys(volumeMapper).length ? volumeMapper : volumeMapperCached,
          Object.keys(tvlMapper).length ? tvlMapper : tvlMapperCached,
          userPoolList,
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
  const { filterKey, searchText, sortBy, sortByOrder } = searchParams
  let parsedSearchText = searchText
  if (searchText && searchText.length > 20) {
    parsedSearchText = chunk(searchText, 5)
      .map((group) => group[0])
      .join('')
  }
  return `${chainId}-${filterKey}-${sortBy}-${sortByOrder}-${parsedSearchText}`
}

export default createPoolListSlice
