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

import chunk from 'lodash/chunk'
import cloneDeep from 'lodash/cloneDeep'
import isUndefined from 'lodash/isUndefined'
import orderBy from 'lodash/orderBy'
import uniqBy from 'lodash/uniqBy'

import { SEARCH_TERM } from '@/hooks/useSearchTermMapper'
import { parseSearchTermResults } from '@/components/PagePoolList/utils'
import { groupSearchTerms, searchByText } from '@/shared/curve-lib'
import networks from '@/networks'

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

// prettier-ignore
export type PoolListSlice = {
  poolList: SliceState & {
    filterByKey(key: FilterKey, poolDatas: (PoolDataCache | PoolData)[], userPoolList: { [p: string]: boolean } | undefined): (PoolDataCache | PoolData)[]
    filterBySearchText(searchText: string, poolDatas: (PoolDataCache | PoolData)[], highlightResult?: boolean): (PoolDataCache | PoolData)[]
    filterSmallTvl(poolDatas: (PoolDataCache | PoolData)[], tvlMapper: TvlMapper, chainId: ChainId): (PoolDataCache | PoolData)[]
    sortFn(sortKey: SortKey, order: Order, poolDatas: (PoolDataCache | PoolData)[], rewardsApyMapper: RewardsApyMapper, tvlMapper: TvlMapper, volumeMapper: VolumeMapper, campaignRewardsMapper: CampaignRewardsMapper): (PoolDataCache | PoolData)[]
    setFormValues(rChainId: ChainId, searchParams: SearchParams, sortSearchTextLast: boolean, poolDatasCachedOrApi: (PoolDataCache | PoolData)[], rewardsApyMapper: RewardsApyMapper, volumeMapper: VolumeMapper, tvlMapper: TvlMapper, userPoolList: UserPoolListMapper | undefined, campaignRewardsMapper: CampaignRewardsMapper): void

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
    filterSmallTvl: (poolDatas: (PoolDataCache | PoolData)[], tvlMapper: TvlMapper, chainId: ChainId) => {
      const hideSmallPoolsTvl = networks[chainId].hideSmallPoolsTvl
      return poolDatas.filter(({ pool }) => {
        return +(tvlMapper?.[pool.id]?.value || '0') > hideSmallPoolsTvl
      })
    },
    sortFn: (
      sortKey: SortKey,
      order: Order,
      poolDatas: (PoolDataCache | PoolData)[],
      rewardsApyMapper: RewardsApyMapper,
      tvlMapper: TvlMapper,
      volumeMapper: VolumeMapper,
      campaignRewardsMapper: CampaignRewardsMapper,
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
    setFormValues: (
      rChainId,
      searchParams,
      sortSearchTextLast,
      poolDatasCachedOrApi,
      rewardsApyMapper,
      volumeMapper,
      tvlMapper,
      userPoolList,
      campaignRewardsMapper,
    ) => {
      let { formValues, formStatus, result, ...sliceState } = get()[sliceKey]
      const activeKey = getPoolListActiveKey(rChainId, searchParams)
      const storedResults = result[activeKey]

      const { hideSmallPools, searchText, filterKey, sortBy, sortByOrder } = searchParams

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

      if (
        (filterKey === 'user' && isUndefined(userPoolList)) ||
        (sortBy.startsWith('rewards') && isUndefined(rewardsApyMapper)) ||
        (sortBy === 'volume' && isUndefined(volumeMapper)) ||
        (sortBy === 'tvl' && isUndefined(tvlMapper)) ||
        (sortBy === 'points' && isUndefined(campaignRewardsMapper))
      ) {
        sliceState.setStateByActiveKey('formStatus', activeKey, {
          ...DEFAULT_FORM_STATUS,
          isLoading: true,
        })
      } else {
        sliceState.setStateByActiveKey('formStatus', activeKey, {
          ...DEFAULT_FORM_STATUS,
          isLoading: !storedResults,
        })
        sliceState.setStateByKeys({ activeKey, formValues })

        let tablePoolDatas = [...poolDatasCachedOrApi]

        if (
          filterKey !== 'user' &&
          hideSmallPools &&
          (networks[rChainId].showHideSmallPoolsCheckbox || poolDatasCachedOrApi.length > 10)
        ) {
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

        // searchText (show before sortBy if it does not exist in updated search params)
        if (searchText && !sortSearchTextLast) {
          tablePoolDatas = sliceState.filterBySearchText(searchText, tablePoolDatas)
        }

        // sort by table labels 'pool | factory | type | rewards...'
        if (sortBy && !sortSearchTextLast) {
          tablePoolDatas = sliceState.sortFn(
            sortBy,
            sortByOrder,
            tablePoolDatas,
            rewardsApyMapper,
            tvlMapper,
            volumeMapper ?? {},
            campaignRewardsMapper,
          )
        }

        // searchText
        if (searchText && sortSearchTextLast) {
          tablePoolDatas = sliceState.filterBySearchText(searchText, tablePoolDatas)
        }

        // get pool ids
        const result: string[] = []
        const hidePoolsMapper = networks[rChainId].customPoolIds

        for (const idx in tablePoolDatas) {
          const poolData = tablePoolDatas[idx]
          if (!hidePoolsMapper[poolData.pool.id]) {
            result.push(poolData.pool.id)
          }
        }

        // set result
        sliceState.setStateByActiveKey('result', activeKey, result)

        sliceState.setStateByActiveKey('formStatus', activeKey, {
          ...(formStatus[activeKey] ?? DEFAULT_FORM_STATUS),
          noResult: poolDatasCachedOrApi.length === 0 ? false : result.length === 0,
          isLoading: poolDatasCachedOrApi.length === 0,
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

export default createPoolListSlice
