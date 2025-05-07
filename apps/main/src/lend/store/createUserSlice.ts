import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import apiLending, { helpers } from '@/lend/lib/apiLending'
import type { State } from '@/lend/store/useStore'
import {
  Api,
  UsersLoansHealthsMapper,
  UserLoanState,
  UsersLoansStatesMapper,
  UserLoanDetails,
  UsersLoansDetailsMapper,
  UserLoanExists,
  UsersLoansExistsMapper,
  UserMarketBalances,
  UsersMarketsBalancesMapper,
} from '@/lend/types/lend.types'
import { OneWayMarketTemplate } from '@/lend/types/lend.types'
import { log } from '@ui-kit/lib/logging'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  loansExistsMapper: UsersLoansExistsMapper
  loansDetailsMapper: UsersLoansDetailsMapper
  marketsBalancesMapper: UsersMarketsBalancesMapper

  // for market list
  loansHealthsMapper: UsersLoansHealthsMapper
  loansStatesMapper: UsersLoansStatesMapper
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    // groups
    fetchDatas(key: string, api: Api, markets: OneWayMarketTemplate[], shouldRefetch?: boolean): Promise<void>
    fetchLoanDatas(key: string, api: Api, markets: OneWayMarketTemplate[], shouldRefetch?: boolean): Promise<void>
    fetchUsersLoansExists(api: Api, markets: OneWayMarketTemplate[], shouldRefetch?: boolean): Promise<void>

    // individual
    fetchUserLoanExists(api: Api, market: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<UserLoanExists>
    fetchUserLoanDetails(api: Api, market: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<UserLoanDetails>
    fetchUserMarketBalances(api: Api, market: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<UserMarketBalances>
    fetchUserLoanState(api: Api, market: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<UserLoanState>
    fetchAll(api: Api, market: OneWayMarketTemplate, shouldRefetch?: boolean): Promise<{ userLoanDetailsResp: UserLoanDetails | null; userLoanBalancesResp: UserMarketBalances; }>

    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  loansExistsMapper: {},
  loansDetailsMapper: {},
  marketsBalancesMapper: {},

  // for market list
  loansHealthsMapper: {},
  loansStatesMapper: {},
}

const createUserSlice = (set: SetState<State>, get: GetState<State>): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    // groups
    fetchDatas: async (key, api, markets, shouldRefetch) => {
      if (!api.signerAddress) return

      const fnMapper = {
        marketsBalancesMapper: apiLending.user.fetchMarketBalances,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const storedMapper = get()[sliceKey][k] ?? {}
      const missing = markets.filter((market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        return typeof storedMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      if (typeof fnMapper[k] !== 'function') log('missing function', k)
      const resp = await fnMapper[k](api, shouldRefetch ? markets : missing)
      const cMapper = cloneDeep(storedMapper)
      Object.keys(resp).forEach((userActiveKey) => {
        cMapper[userActiveKey] = resp[userActiveKey]
      })
      get()[sliceKey].setStateByKey(k, cMapper)
    },
    fetchLoanDatas: async (key, api, markets, shouldRefetch) => {
      if (!api.signerAddress) return

      const fnMapper = {
        loansDetailsMapper: apiLending.user.fetchLoansDetails,
        loansHealthsMapper: apiLending.user.fetchLoansDetailsHealth,
        loansStatesMapper: apiLending.user.fetchLoansDetailsState,
        marketsBalancesMapper: apiLending.user.fetchMarketBalances,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const loansExistsMapper = get()[sliceKey].loansExistsMapper ?? {}
      const storedMapper = get()[sliceKey][k] ?? {}

      const missing = markets.filter((market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        const { loanExists } = loansExistsMapper[userActiveKey] ?? {}
        return loanExists && typeof storedMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      let parsedOwmDatas = missing

      // get only markets with loans
      if (shouldRefetch) {
        parsedOwmDatas = markets.filter((market) => {
          const userActiveKey = helpers.getUserActiveKey(api, market)
          return loansExistsMapper[userActiveKey]?.loanExists
        })
      }

      // fetch data
      if (typeof fnMapper[k] !== 'function') log('missing function2', k)
      const resp = await fnMapper[k](api, parsedOwmDatas)
      const cMapper = { ...storedMapper }

      Object.keys(resp).forEach((userActiveKey) => {
        cMapper[userActiveKey] = resp[userActiveKey]
      })
      get()[sliceKey].setStateByKey(k, cMapper)
    },
    fetchUsersLoansExists: async (api, markets, shouldRefetch) => {
      const storedLoanExistsMapper = get()[sliceKey].loansExistsMapper

      const missing = markets.filter((market) => {
        const userActiveKey = helpers.getUserActiveKey(api, market)
        return typeof storedLoanExistsMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      const parsedOwmDatas = shouldRefetch ? markets : missing
      const loansExists = await apiLending.user.fetchLoansExists(api, parsedOwmDatas)
      const cLoanExistsMapper = cloneDeep(storedLoanExistsMapper)
      Object.keys(loansExists).forEach((owmId) => {
        cLoanExistsMapper[owmId] = loansExists[owmId]
      })
      get()[sliceKey].setStateByKey('loansExistsMapper', cLoanExistsMapper)
    },

    // individual
    fetchUserLoanExists: async (api, market, shouldRefetch) => {
      await get()[sliceKey].fetchUsersLoansExists(api, [market], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, market)
      return get()[sliceKey].loansExistsMapper[userActiveKey]
    },
    fetchUserLoanDetails: async (api, market, shouldRefetch) => {
      const key = 'loansDetailsMapper'
      await get()[sliceKey].fetchDatas(key, api, [market], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, market)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchUserLoanState: async (api, market, shouldRefetch) => {
      const key = 'loansStatesMapper'
      await get()[sliceKey].fetchLoanDatas(key, api, [market], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, market)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchUserMarketBalances: async (api, market, shouldRefetch) => {
      const key = 'marketsBalancesMapper'
      await get()[sliceKey].fetchDatas(key, api, [market], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, market)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchAll: async (api, market, shouldRefetch) => {
      const userActiveKey = helpers.getUserActiveKey(api, market)
      const keys = ['loansDetailsMapper', 'marketsBalancesMapper'] as const

      await Promise.all(keys.map((key) => get()[sliceKey].fetchLoanDatas(key, api, [market], shouldRefetch)))
      return {
        userLoanDetailsResp: get()[sliceKey].loansDetailsMapper[userActiveKey],
        userLoanBalancesResp: get()[sliceKey].marketsBalancesMapper[userActiveKey],
      }
    },

    // slice helpers
    setStateByActiveKey: (key, activeKey, value) => {
      get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(sliceKey, key, value)
    },
    setStateByKeys: (sliceState) => {
      get().setAppStateByKeys(sliceKey, sliceState)
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

export default createUserSlice
