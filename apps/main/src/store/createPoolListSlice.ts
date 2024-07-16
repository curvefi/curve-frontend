import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { FilterKey, FormStatus, FormValues, Order, SearchParams, SortKey } from '@/components/PagePoolList/types'
import type { CampaignRewardsMapper } from '@/ui/CampaignRewards/types'

import Fuse from 'fuse.js'
import chunk from 'lodash/chunk'
import cloneDeep from 'lodash/cloneDeep'
import differenceWith from 'lodash/differenceWith'
import endsWith from 'lodash/endsWith'
import isUndefined from 'lodash/isUndefined'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { isStartPartOrEnd, parsedSearchTextToList } from '@/components/PagePoolList/utils'
import networks from '@/networks'

type StateKey = keyof typeof DEFAULT_STATE

export const DEFAULT_FORM_VALUES: FormValues = {
  searchTextByTokensAndAddresses: {},
  searchTextByOther: {},
  hideSmallPools: true,
  hideZero: true,
}

export const DEFAULT_SEARCH_PARAMS: SearchParams = {
  filterKey: 'all',
  hideSmallPools: true,
  searchText: '',
  sortBy: 'volume',
  sortByOrder: 'desc',
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
  resultRewardsCrvCount: number
  resultRewardsOtherCount: number
  showHideSmallPools: boolean
}

// prettier-ignore
export type PoolListSlice = {
  poolList: SliceState & {
    filterByKey(key: FilterKey, poolDatas: (PoolDataCache | PoolData)[], userPoolList: { [p: string]: boolean } | undefined): (PoolDataCache | PoolData)[]
    filterBySearchText(searchText: string, poolDatas: (PoolDataCache | PoolData)[]): (PoolDataCache | PoolData)[]
    filterSmallTvl(poolDatas: (PoolDataCache | PoolData)[], tvlMapper: TvlMapper, chainId: ChainId): (PoolDataCache | PoolData)[]
    sortFn(sortKey: SortKey, order: Order, poolDatas: (PoolDataCache | PoolData)[], rewardsApyMapper: RewardsApyMapper, tvlMapper: TvlMapper, volumeMapper: VolumeMapper, campaignRewardsMapper: CampaignRewardsMapper): (PoolDataCache | PoolData)[]
    setFormValues(rChainId: ChainId, searchParams: SearchParams, poolDatasCachedOrApi: (PoolDataCache | PoolData)[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper, tvlMapper: TvlMapper, userPoolList: UserPoolListMapper | undefined, campaignRewardsMapper: CampaignRewardsMapper): Promise<void>

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
  resultRewardsCrvCount: 0,
  resultRewardsOtherCount: 0,
  showHideSmallPools: false,
}

const sliceKey = 'poolList'

const createPoolListSlice = (set: SetState<State>, get: GetState<State>) => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterByKey: (
      key: FilterKey,
      poolDatas: (PoolDataCache | PoolData)[],
      userPoolList: { [poolId: string]: boolean } | undefined
    ) => {
      if (key === 'user') {
        return poolDatas.filter(({ pool }) => (userPoolList ?? {})[pool.id])
      } else if (key === 'btc' || key === 'crypto' || key === 'eth' || key === 'usd' || key === 'kava') {
        return poolDatas.filter(({ pool }) => pool.referenceAsset.toLowerCase() === key)
      } else if (key === 'crvusd') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-crvusd'))
      } else if (key === 'tricrypto') {
        return poolDatas.filter(
          ({ pool }) => pool.id.startsWith('factory-tricrypto') || pool.id.startsWith('tricrypto')
        )
      } else if (key === 'stableng') {
        return poolDatas.filter(({ pool }) => pool.id.startsWith('factory-stable-ng'))
      } else if (key === 'cross-chain') {
        return poolDatas.filter(({ pool }) => {
          return (
            pool.address === '0x939721ce04332ca04b100154e0c8fcbb4ebaf695' ||
            pool.address === '0x228f20f430fd7a6f5b1abea69a5ab8eb2973853c' ||
            pool.address === '0x6bb9a6b7066445da6bef268b91810ae750431587' ||
            pool.address === '0x4df0b8323f7b6d45abf39ecbd3f18bd5fcbcb1b2' ||
            pool.address === '0x6e0dc5a4ef555277db3435703f0e287040013763' ||
            pool.name.startsWith('CrossCurve')
          )
        })
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
    filterBySearchText: (searchText: string, poolDatas: (PoolDataCache | PoolData)[]) => {
      let parsedSearchText = searchText.toLowerCase().trim()

      let results: { searchTerm: string; results: (PoolDataCache | PoolData)[] } = {
        searchTerm: '',
        results: [],
      }

      const searchPoolByTokensAddressesResult = searchPoolByTokensAddresses(parsedSearchText, searchText, poolDatas)
      const searchPoolByOtherResult = searchPoolByOther(parsedSearchText, searchText, poolDatas)
      results.searchTerm = parsedSearchText
      results.results = uniqBy([...searchPoolByTokensAddressesResult, ...searchPoolByOtherResult], (r) => r.pool.id)

      get()[sliceKey].setStateByKey('formValues', {
        ...get()[sliceKey].formValues,
        searchTextByTokensAndAddresses: searchPoolByTokensAddressesResult.reduce((p, poolData) => {
          p[poolData.pool.address] = true
          return p
        }, {} as { [address: string]: boolean }),
        searchTextByOther: searchPoolByOtherResult.reduce((p, poolData) => {
          p[poolData.pool.address] = true
          return p
        }, {} as { [address: string]: boolean }),
      })

      if (results.searchTerm === parsedSearchText) {
        return results.results
      }
    },
    filterSmallTvl: (poolDatas: (PoolDataCache | PoolData)[], tvlMapper: TvlMapper, chainId: ChainId) => {
      const hideSmallPoolsTvl = networks[chainId].hideSmallPoolsTvl
      return poolDatas.filter(({ pool }) => {
        return +(tvlMapper[pool.id]?.value || '0') > hideSmallPoolsTvl
      })
    },
    sortFn: (
      sortKey: SortKey,
      order: Order,
      poolDatas: (PoolDataCache | PoolData)[],
      rewardsApyMapper: RewardsApyMapper,
      tvlMapper: TvlMapper,
      volumeMapper: VolumeMapper,
      campaignRewardsMapper: CampaignRewardsMapper
    ) => {
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
            const { pool, gaugeStatus } = poolData
            const { base, crv = [], other = [] } = rewardsApyMapper[pool.id] ?? {}
            if (sortKey === 'rewardsBase') {
              return Number(base?.day ?? 0)
            } else if (sortKey === 'rewardsCrv') {
              // Replacing areCrvRewardsStuckInBridge or rewardsNeedNudging CRV with 0
              const showZero = gaugeStatus?.areCrvRewardsStuckInBridge || gaugeStatus?.rewardsNeedNudging
              return showZero ? 0 : Number(crv?.[0] ?? 0)
            } else if (sortKey === 'rewardsOther') {
              return other.length > 0 ? other.reduce((total, { apy }) => total + apy, 0) : 0
            }
          },
          [order]
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
          [order]
        )
      }
      return poolDatas
    },
    setFormValues: (
      rChainId: ChainId,
      searchParams: SearchParams,
      poolDatasCachedOrApi: (PoolDataCache | PoolData)[],
      rewardsApyMapper: RewardsApyMapper,
      volumeMapper: VolumeMapper,
      tvlMapper: TvlMapper,
      userPoolList: UserPoolListMapper | undefined,
      campaignRewardsMapper: CampaignRewardsMapper
    ) => {
      const activeKey = getPoolListActiveKey(rChainId, searchParams)
      const state = get()[sliceKey]
      const storedResults = state.result[activeKey]

      const { hideSmallPools, searchText, filterKey, sortBy, sortByOrder } = searchParams

      // update form values
      let clonedFormValues = cloneDeep({
        ...state.formValues,
        hideSmallPools,
        searchTextByTokensAndAddresses: {},
        searchTextByOther: {},
      })

      if (
        (filterKey === 'user' && isUndefined(userPoolList)) ||
        (sortBy.startsWith('rewards') && isUndefined(rewardsApyMapper)) ||
        (sortBy === 'volume' && isUndefined(volumeMapper)) ||
        (sortBy === 'tvl' && isUndefined(tvlMapper)) ||
        (sortBy === 'points' && isUndefined(campaignRewardsMapper))
      ) {
        state.setStateByActiveKey('formStatus', activeKey, {
          ...DEFAULT_FORM_STATUS,
          isLoading: true,
        })
      } else {
        state.setStateByActiveKey('formStatus', activeKey, {
          ...DEFAULT_FORM_STATUS,
          isLoading: !storedResults,
        })
        state.setStateByKeys({ activeKey, formValues: clonedFormValues })

        let tablePoolDatas = [...poolDatasCachedOrApi]

        if (
          filterKey !== 'user' &&
          hideSmallPools &&
          (networks[rChainId].showHideSmallPoolsCheckbox || poolDatasCachedOrApi.length > 10)
        ) {
          tablePoolDatas = state.filterSmallTvl(tablePoolDatas, tvlMapper, rChainId)
        }

        // searchText
        if (searchText) {
          tablePoolDatas = state.filterBySearchText(searchText, tablePoolDatas)
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
            tablePoolDatas = state.filterByKey(filterKey, tablePoolDatas, userPoolList)
          } else {
            tablePoolDatas = state.filterBySearchText(filterKey, tablePoolDatas)
          }
        }

        // sort by table labels 'pool | factory | type | rewards...'
        if (sortBy) {
          tablePoolDatas = state.sortFn(
            sortBy,
            sortByOrder,
            tablePoolDatas,
            rewardsApyMapper,
            tvlMapper,
            volumeMapper ?? {},
            campaignRewardsMapper
          )
        }

        // get pool ids
        const result: string[] = []
        let resultRewardsOtherCount = 0
        let resultRewardsCrvCount = 0
        const hidePoolsMapper = networks[rChainId].customPoolIds

        for (const idx in tablePoolDatas) {
          const poolData = tablePoolDatas[idx]
          if (!hidePoolsMapper[poolData.pool.id]) {
            const { crv = [], other = [] } = rewardsApyMapper[poolData.pool.id] ?? {}
            if (other.length > 0) resultRewardsOtherCount++
            if (crv?.[0] > 0) resultRewardsCrvCount++
            result.push(poolData.pool.id)
          }
        }

        // set result
        state.setStateByActiveKey('result', activeKey, result)
        state.setStateByKeys({ resultRewardsOtherCount, resultRewardsCrvCount })

        state.setStateByActiveKey('formStatus', activeKey, {
          ...state.formStatus,
          noResult: result.length === 0,
          isLoading: false,
        })
      }
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
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export function getPoolDatasCached(poolsMapperCached: PoolDataCacheMapper | undefined) {
  const poolDatasCached: PoolDataCache[] = []

  if (poolsMapperCached) {
    for (const key in poolsMapperCached) {
      poolDatasCached.push(poolsMapperCached[key])
    }
  }

  return poolDatasCached
}

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

// search by tokens or token addresses
function searchPoolByTokensAddresses(
  parsedSearchText: string,
  searchText: string,
  poolDatas: (PoolDataCache | PoolData)[]
) {
  const searchTextByList = parsedSearchTextToList(parsedSearchText)

  return poolDatas.filter((p) => {
    return (
      differenceWith(searchTextByList, p.tokensLowercase, (parsedSearchText, token) =>
        isStartPartOrEnd(parsedSearchText, token)
      ).length === 0 ||
      differenceWith(searchTextByList, p.tokenAddresses, (parsedSearchText, tokenAddress) =>
        isStartPartOrEnd(parsedSearchText, tokenAddress)
      ).length === 0
    )
  })
}

// search by pool name, address, lpToken and gauge
function searchPoolByOther(parsedSearchText: string, searchText: string, poolDatas: (PoolDataCache | PoolData)[]) {
  const fuse = new Fuse<PoolDataCache | PoolData>(poolDatas, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: ['pool.address', 'pool.name', 'pool.gauge', 'pool.lpToken'],
  })
  const result = fuse.search(parsedSearchText)
  let filteredByOther = result.map((r) => r.item)

  if (result.length === 0) {
    filteredByOther = poolDatas.filter((item) => {
      const haveMatchedPoolAddress = endsWith(item.pool.address, parsedSearchText)
      const haveMatchedTokenAddress = item.tokenAddresses.some((tokenAddress) => endsWith(tokenAddress, searchText))
      return haveMatchedPoolAddress || haveMatchedTokenAddress
    })

    if (filteredByOther.length === 0) {
      // increase threshold to allow more results
      const fuse = new Fuse<PoolDataCache | PoolData>(poolDatas, {
        ignoreLocation: true,
        threshold: 0.08,
        findAllMatches: true,
        useExtendedSearch: true,
        keys: ['pool.name', 'tokensAll'],
      })

      let extendedSearchText = ''
      const parsedSearchTextSplit = parsedSearchText.split(' ')
      for (const idx in parsedSearchTextSplit) {
        const word = parsedSearchTextSplit[idx]
        extendedSearchText = `${extendedSearchText} '${word}`
      }
      const result = fuse.search(extendedSearchText)
      if (result.length > 0) {
        filteredByOther = result.map((r) => r.item)
      }
    }
  }
  return filteredByOther
}

export default createPoolListSlice
