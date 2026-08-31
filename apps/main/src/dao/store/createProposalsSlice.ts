import type { StoreApi } from 'zustand'
import type { State } from '@/dao/store/useStore'
import { ProposalListFilter, SortByFilterProposals, SortDirection } from '@/dao/types/dao.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilterProposals
  activeSortDirection: SortDirection
}

const SLICE_KEY = 'proposals'

export type ProposalsSlice = {
  [SLICE_KEY]: SliceState & {
    setSearchValue: (searchValue: string) => void
    setActiveFilter: (filter: ProposalListFilter) => void
    setActiveSortBy: (sortBy: SortByFilterProposals) => void
    setActiveSortDirection: (direction: SortDirection) => void
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = {
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'timeCreated',
  activeSortDirection: 'desc',
}

export const createProposalsSlice = (
  _set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): ProposalsSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,
    setSearchValue: filterValue => {
      get()[SLICE_KEY].setStateByKey('searchValue', filterValue)
    },
    setActiveFilter: (filter: ProposalListFilter) => {
      get()[SLICE_KEY].setStateByKey('activeFilter', filter)
    },
    setActiveSortDirection: (direction: SortDirection) => {
      get()[SLICE_KEY].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilterProposals) => {
      get()[SLICE_KEY].setStateByKey('activeSortBy', sortBy)
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(SLICE_KEY, key, value)
    },
    setStateByKeys: sliceState => {
      get().setAppStateByKeys(SLICE_KEY, sliceState)
    },
    resetState: () => {
      get().resetAppState(SLICE_KEY, DEFAULT_STATE)
    },
  },
})
