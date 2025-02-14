import type { GetState, SetState } from 'zustand'
import type { State } from '@/dex/store/useStore'
import cloneDeep from 'lodash/cloneDeep'
import { Token } from '@/dex/types/main.types'
import { filterTokens } from '@ui-kit/utils'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  filterValue: string
  selectTokensResult: Token[]
}

type FilterOptions = {
  showSearch?: boolean
  endsWith(string: string, substring: string): boolean
}

const sliceKey = 'selectToken'

export type SelectTokenSlice = {
  [sliceKey]: SliceState & {
    filterFn(filterValue: string, tokens: Token[], filterOptions: FilterOptions): Token[]
    setFilterValue(filterValue: string, tokens: Token[], filterOptions: FilterOptions): void

    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  filterValue: '',
  selectTokensResult: [],
}

const createSelectTokenSlice = (set: SetState<State>, get: GetState<State>): SelectTokenSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,

    filterFn: (filterValue, tokens, { endsWith }) => filterTokens(filterValue, tokens, endsWith),
    setFilterValue: (filterValue, tokens, filterOptions) => {
      get()[sliceKey].setStateByKey('filterValue', filterValue)

      // filter result
      let result = tokens

      if (filterValue && filterOptions.showSearch) {
        result = get()[sliceKey].filterFn(filterValue, tokens, filterOptions)
      }
      get()[sliceKey].setStateByKey('selectTokensResult', result)
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

export default createSelectTokenSlice
