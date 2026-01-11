import { Contract, type Signer } from 'ethers'
import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import { ABI_VECRV } from '@/dao/abis/vecrv'
import { CONTRACT_VECRV } from '@/dao/constants'
import type { State } from '@/dao/store/useStore'
import {
  CurveApi,
  SnapshotVotingPower,
  SortDirection,
  UserGaugeVotesSortBy,
  UserGaugeVoteWeightSortBy,
  UserLocksSortBy,
  UserProposalVotesSortBy,
  type Wallet,
} from '@/dao/types/dao.types'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  userVeCrv: {
    veCrv: string
    veCrvPct: string
    lockedCrv: string
    unlockTime: number
  }
  snapshotVeCrvMapper: {
    [proposalId: string]: SnapshotVotingPower
  }
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
    updateUserData(curve: CurveApi, wallet: Wallet): void

    setUserProposalVotesSortBy(sortBy: UserProposalVotesSortBy): void
    setUserLocksSortBy: (sortBy: UserLocksSortBy) => void
    setUserGaugeVotesSortBy: (sortBy: UserGaugeVotesSortBy) => void
    setUserGaugeVoteWeightsSortBy: (sortBy: UserGaugeVoteWeightSortBy) => void
    setSnapshotVeCrv(signer: Signer, userAddress: string, snapshot: number, proposalId: string): void
    // helpers
    setStateByActiveKey<T>(key: StateKey, activeKey: string, value: T): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  userVeCrv: {
    veCrv: '0',
    veCrvPct: '0',
    lockedCrv: '0',
    unlockTime: 0,
  },
  snapshotVeCrvMapper: {},
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
    updateUserData: async (curve: CurveApi, wallet: Wallet) => {
      const userAddress = wallet.address

      try {
        const veCRV = await curve.dao.userVeCrv(userAddress)

        get()[sliceKey].setStateByKey('userVeCrv', veCRV)
      } catch (error) {
        console.error(error)
      }

      get()[sliceKey].setStateByKeys({
        snapshotVeCrvMapper: {},
      })
    },
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
    setSnapshotVeCrv: async (signer: Signer, userAddress: string, snapshot: number, proposalId: string) => {
      set(
        produce((state) => {
          state[sliceKey].snapshotVeCrvMapper[proposalId] = {
            loading: true,
            value: null,
            blockNumber: null,
          }
        }),
      )

      const contract = new Contract(CONTRACT_VECRV, ABI_VECRV, signer)
      const snapshotValue = await contract.balanceOfAt(userAddress, snapshot)

      set(
        produce((state) => {
          state[sliceKey].snapshotVeCrvMapper[proposalId] = {
            loading: false,
            value: Number(snapshotValue) / 1e18,
            blockNumber: snapshot,
          }
        }),
      )
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
