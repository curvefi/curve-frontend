import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { WalletState } from '@web3-onboard/core'

import { useConnectWallet } from '@/onboard'

import { getWalletSignerAddress, getWalletSignerEns } from '@/store/createWalletSlice'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  userVeCrv: {
    veCrv: string
    veCrvPct: string
    lockedCrv: string
    unlockTime: number
  }
  userAddress: string | null
  userEns: string | null
  userVotesMapper: { [voteId: string]: UserVoteData }
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    updateUserData(curve: CurveApi, wallet: WalletState): void
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
  userAddress: null,
  userEns: null,
  userVotesMapper: {},
}

const createUserSlice = (set: SetState<State>, get: GetState<State>): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    updateUserData: async (curve: CurveApi, wallet: WalletState) => {
      const userAddress = getWalletSignerAddress(wallet)

      try {
        const veCRV = await curve.dao.userVeCrv(userAddress)

        get()[sliceKey].setStateByKey('userVeCrv', veCRV)
      } catch (error) {
        console.error(error)
      }

      try {
        const userVotes = await curve.dao.userProposalVotes()

        let userProposalsObject: { [voteId: string]: UserVoteData } = {}

        for (const vote of userVotes) {
          userProposalsObject[`${vote.voteId}-${vote.voteType}`] = {
            voteId: vote.voteId,
            voteType: vote.voteType,
            userVote: vote.userVote,
          }
        }

        get()[sliceKey].setStateByKey('userVotesMapper', userProposalsObject)
      } catch (error) {
        console.error(error)
      }

      get()[sliceKey].setStateByKeys({
        userAddress,
        userEns: getWalletSignerEns(wallet),
      })
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

export default createUserSlice
