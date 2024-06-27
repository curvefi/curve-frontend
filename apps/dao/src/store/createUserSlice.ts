import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { WalletState } from '@web3-onboard/core'

import { Contract, formatEther } from 'ethers'
import produce from 'immer'

import { getWalletSignerAddress, getWalletSignerEns } from '@/store/createWalletSlice'
import { contractVeCRV } from '@/store/contracts'
import { abiVeCrv } from '@/store/abis'

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
  userAddress: string | null
  userEns: string | null
  userVotesMapper: { [voteId: string]: UserVoteData }
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    updateUserData(curve: CurveApi, wallet: WalletState): void
    setSnapshotVeCrv(signer: any, userAddress: string, snapshot: number, proposalId: string): void
    setUserProposalVotes(curve: CurveApi): void
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
  userAddress: null,
  userEns: null,
  userVotesMapper: {},
}

const createUserSlice = (set: SetState<State>, get: GetState<State>): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    updateUserData: async (curve: CurveApi, wallet: WalletState) => {
      const setUserProposalVotes = get()[sliceKey].setUserProposalVotes
      const userAddress = getWalletSignerAddress(wallet)

      try {
        const veCRV = await curve.dao.userVeCrv(userAddress)

        get()[sliceKey].setStateByKey('userVeCrv', veCRV)
      } catch (error) {
        console.error(error)
      }

      setUserProposalVotes(curve)

      get()[sliceKey].setStateByKeys({
        userAddress,
        userEns: getWalletSignerEns(wallet),
        snapshotVeCrvMapper: {},
      })
    },
    setSnapshotVeCrv: async (signer: any, userAddress: string, snapshot: number, proposalId: string) => {
      set(
        produce((state) => {
          state[sliceKey].snapshotVeCrvMapper[proposalId] = {
            loading: true,
            value: null,
            blockNumber: null,
          }
        })
      )

      const contract = new Contract(contractVeCRV, abiVeCrv, signer)
      const snapshotValue = await contract.balanceOfAt(userAddress, snapshot)

      set(
        produce((state) => {
          state[sliceKey].snapshotVeCrvMapper[proposalId] = {
            loading: false,
            value: Number(formatEther(snapshotValue)),
            blockNumber: snapshot,
          }
        })
      )
    },
    setUserProposalVotes: async (curve: CurveApi) => {
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
