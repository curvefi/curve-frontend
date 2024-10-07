import cloneDeep from 'lodash/cloneDeep'
import type { GetState, SetState } from 'zustand'
import apiLending, { helpers } from '@/lib/apiLending'
import type { State } from '@/store/useStore'


import { log } from '@/shared/lib/logging'

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
    fetchDatas(key: string, api: Api, owmDatas: OWMData[], shouldRefetch?: boolean): Promise<void>
    fetchLoanDatas(key: string, api: Api, owmDatas: OWMData[], shouldRefetch?: boolean): Promise<void>
    fetchUsersLoansExists(api: Api, owmDatas: OWMData[], shouldRefetch?: boolean): Promise<void>

    // individual
    fetchUserLoanExists(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<UserLoanExists>
    fetchUserLoanDetails(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<UserLoanDetails>
    fetchUserMarketBalances(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<UserMarketBalances>
    fetchUserLoanState(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<UserLoanState>
    fetchAll(api: Api, owmData: OWMData, shouldRefetch?: boolean): Promise<{ userLoanDetailsResp: UserLoanDetails | null; userLoanBalancesResp: UserMarketBalances; }>

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
    fetchDatas: async (key, api, owmDatas, shouldRefetch) => {
      if (!api.signerAddress) return

      const fnMapper = {
        marketsBalancesMapper: apiLending.user.fetchMarketBalances,
      }

      // stored
      const k = key as keyof typeof fnMapper
      const storedMapper = get()[sliceKey][k] ?? {}
      const missing = owmDatas.filter((owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        return typeof storedMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      if (typeof fnMapper[k] !== 'function') log('missing function', k)
      const resp = await fnMapper[k](api, shouldRefetch ? owmDatas : missing)
      const cMapper = cloneDeep(storedMapper)
      Object.keys(resp).forEach((userActiveKey) => {
        cMapper[userActiveKey] = resp[userActiveKey]
      })
      get()[sliceKey].setStateByKey(k, cMapper)
    },
    fetchLoanDatas: async (key, api, owmDatas, shouldRefetch) => {
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

      const missing = owmDatas.filter((owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        const { loanExists } = loansExistsMapper[userActiveKey] ?? {}
        return loanExists && typeof storedMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      let parsedOwmDatas = missing

      // get only owmDatas with loans
      if (shouldRefetch) {
        parsedOwmDatas = owmDatas.filter((owmData) => {
          const userActiveKey = helpers.getUserActiveKey(api, owmData)
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
    fetchUsersLoansExists: async (api, owmDatas, shouldRefetch) => {
      const storedLoanExistsMapper = get()[sliceKey].loansExistsMapper

      const missing = owmDatas.filter((owmData) => {
        const userActiveKey = helpers.getUserActiveKey(api, owmData)
        return typeof storedLoanExistsMapper[userActiveKey] === 'undefined'
      })

      if (missing.length === 0 && !shouldRefetch) return

      const parsedOwmDatas = shouldRefetch ? owmDatas : missing
      const loansExists = await apiLending.user.fetchLoansExists(api, parsedOwmDatas)
      const cLoanExistsMapper = cloneDeep(storedLoanExistsMapper)
      Object.keys(loansExists).forEach((owmId) => {
        cLoanExistsMapper[owmId] = loansExists[owmId]
      })
      get()[sliceKey].setStateByKey('loansExistsMapper', cLoanExistsMapper)
    },

    // individual
    fetchUserLoanExists: async (api, owmData, shouldRefetch) => {
      await get()[sliceKey].fetchUsersLoansExists(api, [owmData], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, owmData)
      return get()[sliceKey].loansExistsMapper[userActiveKey]
    },
    fetchUserLoanDetails: async (api, owmData, shouldRefetch) => {
      const key = 'loansDetailsMapper'
      await get()[sliceKey].fetchDatas(key, api, [owmData], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, owmData)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchUserLoanState: async (api, owmData, shouldRefetch) => {
      const key = 'loansStatesMapper'
      await get()[sliceKey].fetchLoanDatas(key, api, [owmData], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, owmData)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchUserMarketBalances: async (api, owmData, shouldRefetch) => {
      const key = 'marketsBalancesMapper'
      await get()[sliceKey].fetchDatas(key, api, [owmData], shouldRefetch)
      const userActiveKey = helpers.getUserActiveKey(api, owmData)
      return get()[sliceKey][key][userActiveKey]
    },
    fetchAll: async (api, owmData, shouldRefetch) => {
      const userActiveKey = helpers.getUserActiveKey(api, owmData)
      const keys = ['loansDetailsMapper', 'marketsBalancesMapper'] as const

      await Promise.all(keys.map((key) => get()[sliceKey].fetchLoanDatas(key, api, [owmData], shouldRefetch)))
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
