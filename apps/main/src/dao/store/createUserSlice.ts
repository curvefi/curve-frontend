import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import type { State } from '@/dao/store/useStore'
import {
  SortDirection,
  UserGaugeVotesSortBy,
  UserGaugeVoteWeightSortBy,
  UserLocksSortBy,
  UserProposalVotesSortBy,
} from '@/dao/types/dao.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  userLocksSortBy: {
    key: UserLocksSortBy
    order: SortDirection
  }
  userProposalVotesSortBy: {
    key: UserProposalVotesSortBy
    order: SortDirection
  }
  userGaugeVotesSortBy: {
    key: UserGaugeVotesSortBy
    order: SortDirection
  }
  userGaugeVoteWeightsSortBy: {
    key: UserGaugeVoteWeightSortBy
    order: SortDirection
  }
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    setUserProposalVotesSortBy(sortBy: UserProposalVotesSortBy): void
    setUserLocksSortBy: (sortBy: UserLocksSortBy) => void
    setUserGaugeVotesSortBy: (sortBy: UserGaugeVotesSortBy) => void
    setUserGaugeVoteWeightsSortBy: (sortBy: UserGaugeVoteWeightSortBy) => void
    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  userLocksSortBy: {
    key: 'timestamp',
    order: 'desc',
  },
  userProposalVotesSortBy: {
    key: 'voteId',
    order: 'desc',
  },
  userGaugeVotesSortBy: {
    key: 'timestamp',
    order: 'desc',
  },
  userGaugeVoteWeightsSortBy: {
    key: 'userPower',
    order: 'desc',
  },
}

// key user address for user specific snapshots, votes, mappers

export const createUserSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    setUserLocksSortBy: (sortBy: UserLocksSortBy) => {
      const { userLocksSortBy } = get()[sliceKey]
      let order = userLocksSortBy.order

      if (sortBy === userLocksSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            state[sliceKey].userLocksSortBy.order = order
          }),
        )
      } else {
        set(
          produce((state) => {
            state[sliceKey].userLocksSortBy.key = sortBy
            state[sliceKey].userLocksSortBy.order = 'desc'
          }),
        )
      }
    },
    setUserProposalVotesSortBy: (sortBy: UserProposalVotesSortBy) => {
      const { userProposalVotesSortBy } = get()[sliceKey]
      let order = userProposalVotesSortBy.order

      if (sortBy === userProposalVotesSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'
      } else {
        order = 'desc'
      }

      set(
        produce((state) => {
          state[sliceKey].userProposalVotesSortBy.key = sortBy
          state[sliceKey].userProposalVotesSortBy.order = order
        }),
      )
    },
    setUserGaugeVotesSortBy: (sortBy: UserGaugeVotesSortBy) => {
      const { userGaugeVotesSortBy } = get()[sliceKey]
      let order = userGaugeVotesSortBy.order

      if (sortBy === userGaugeVotesSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesSortBy.order = order
          }),
        )
      } else {
        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesSortBy.key = sortBy
            state[sliceKey].userGaugeVotesSortBy.order = 'desc'
          }),
        )
      }
    },
    setUserGaugeVoteWeightsSortBy: (sortBy: UserGaugeVoteWeightSortBy) => {
      const { userGaugeVoteWeightsSortBy } = get()[sliceKey]
      let order = userGaugeVoteWeightsSortBy.order

      if (sortBy === userGaugeVoteWeightsSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            state[sliceKey].userGaugeVoteWeightsSortBy.order = order
          }),
        )
      } else {
        set(
          produce((state) => {
            state[sliceKey].userGaugeVoteWeightsSortBy.key = sortBy
            state[sliceKey].userGaugeVoteWeightsSortBy.order = 'desc'
          }),
        )
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
      get().resetAppState(sliceKey, DEFAULT_STATE)
    },
  },
})
