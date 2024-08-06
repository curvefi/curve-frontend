import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { WalletState } from '@web3-onboard/core'

import { Contract, formatEther, formatUnits } from 'ethers'
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
  userVotesMapper: { [userAddress: string]: UserVoteData }
  userLocksMapper: {
    [userAddress: string]: {
      fetchingState: FetchingState
      locks: UserLock[]
    }
  }
  userMapper: {
    [userAddress: string]: {
      ens: string
    }
  }
  userLocksSortBy: {
    key: UserLocksSortBy
    order: 'asc' | 'desc'
  }
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    updateUserData(curve: CurveApi, wallet: WalletState): void
    getUserEns(userAddress: string): void
    getUserLocks(userAddress: string): void
    setUserLocksSortBy: (userAddress: string, sortBy: UserLocksSortBy) => void
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
  userMapper: {},
  userVotesMapper: {},
  userLocksMapper: {},
  userLocksSortBy: {
    key: 'date',
    order: 'desc',
  },
}

// key user address for user specific snapshots, votes, mappers

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
    getUserEns: async (userAddress: string) => {
      const { provider } = get().wallet

      if (!provider) {
        console.error("Can't fetch ens, no provider available")
        return
      }

      try {
        const ensName = await provider.lookupAddress(userAddress)

        console.log(ensName)

        set(
          produce((state) => {
            state[sliceKey].userMapper[userAddress] = {
              ens: ensName || null,
            }
          })
        )
      } catch (error) {
        console.error('Error fetching ENS name:', error)
        set(
          produce((state) => {
            state[sliceKey].userMapper[userAddress] = {
              ens: null,
            }
          })
        )
      }
    },
    getUserLocks: async (userAddress: string) => {
      set(
        produce((state) => {
          state[sliceKey].userLocksMapper[userAddress] = {
            fetchingState: 'LOADING',
            locks: [],
          }
        })
      )

      try {
        const locksRes = await fetch(`https://prices.curve.fi/v1/dao/locks/${userAddress}`)
        const locks: UserLockRes = await locksRes.json()

        const formattedData = locks.locks.map((lock) => {
          return {
            amount: +lock.amount / 1e18,
            unlock_time: lock.unlock_time,
            lock_type: lock.lock_type,
            locked_balance: +lock.locked_balance / 1e18,
            block_number: lock.block_number,
            date: lock.dt,
            transaction_hash: lock.transaction_hash,
          }
        })

        console.log(formattedData)

        set(
          produce((state) => {
            state[sliceKey].userLocksMapper[userAddress] = {
              fetchingState: 'SUCCESS',
              locks: formattedData,
            }
          })
        )
      } catch (error) {
        console.log(error)

        set(
          produce((state) => {
            state[sliceKey].userLocksMapper[userAddress] = {
              fetchingState: 'ERROR',
              locks: [],
            }
          })
        )
      }
    },
    setUserLocksSortBy: (userAddress: string, sortBy: UserLocksSortBy) => {
      const {
        userLocksMapper: {
          [userAddress]: { locks },
        },
        userLocksSortBy,
      } = get()[sliceKey]

      let order = userLocksSortBy.order
      if (sortBy === userLocksSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            const reversedEntries = [...locks].reverse()
            state[sliceKey].userLocksMapper[userAddress].locks = reversedEntries
            state[sliceKey].userLocksSortBy.order = order
          })
        )
      } else {
        const sortedEntries = [...locks].sort((a, b) => {
          if (sortBy === 'date') {
            const aValue = new Date(a.date).getTime()
            const bValue = new Date(b.date).getTime()
            return bValue - aValue
          }
          return b[sortBy] - a[sortBy]
        })

        set(
          produce((state) => {
            state[sliceKey].userLocksSortBy.sortBy = sortBy
            state[sliceKey].userLocksSortBy.order = 'desc'
            state[sliceKey].userLocksMapper[userAddress].locks = sortedEntries
          })
        )
      }
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
