import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import type { WalletState } from '@web3-onboard/core'

import { Contract } from 'ethers'
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
  userVotesMapper: { [userAddress: string]: UserVoteData[] }
  userProposalVotesMapper: {
    [userAddress: string]: {
      fetchingState: FetchingState
      votes: { [proposalId: string]: UserProposalVoteData }
    }
  }
  userLocksMapper: {
    [userAddress: string]: {
      fetchingState: FetchingState
      locks: UserLock[]
    }
  }
  userGaugeVotesMapper: {
    [userAddress: string]: {
      fetchingState: FetchingState
      votes: UserGaugeVoteData[]
    }
  }
  userMapper: UserMapper
  userLocksSortBy: {
    key: UserLocksSortBy
    order: 'asc' | 'desc'
  }
  userProposalVotesSortBy: {
    key: UserProposalVotesSortBy
    order: 'asc' | 'desc'
  }
  userGaugeVotesSortBy: {
    key: UserGaugeVotesSortBy
    order: 'asc' | 'desc'
  }
}

const sliceKey = 'user'

// prettier-ignore
export type UserSlice = {
  [sliceKey]: SliceState & {
    updateUserData(curve: CurveApi, wallet: WalletState): void
    getUserEns(userAddress: string): void
    getUserProposalVotes(userAddress: string): void
    getUserGaugeVotes(userAddress: string): void
    getUserLocks(userAddress: string): void
    setUserProposalVotesSortBy(userAddress: string, sortBy: UserProposalVotesSortBy): void
    setUserLocksSortBy: (userAddress: string, sortBy: UserLocksSortBy) => void
    setUserGaugeVotesSortBy: (userAddress: string, sortBy: UserGaugeVotesSortBy) => void
    setSnapshotVeCrv(signer: any, userAddress: string, snapshot: number, proposalId: string): void
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
  userProposalVotesMapper: {},
  userGaugeVotesMapper: {},
  userLocksMapper: {},
  userLocksSortBy: {
    key: 'date',
    order: 'desc',
  },
  userProposalVotesSortBy: {
    key: 'vote_id',
    order: 'desc',
  },
  userGaugeVotesSortBy: {
    key: 'timestamp',
    order: 'desc',
  },
}

// key user address for user specific snapshots, votes, mappers

const createUserSlice = (set: SetState<State>, get: GetState<State>): UserSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    updateUserData: async (curve: CurveApi, wallet: WalletState) => {
      const getUserProposalVotes = get()[sliceKey].getUserProposalVotes
      const userAddress = getWalletSignerAddress(wallet)

      try {
        const veCRV = await curve.dao.userVeCrv(userAddress)

        get()[sliceKey].setStateByKey('userVeCrv', veCRV)
      } catch (error) {
        console.error(error)
      }

      getUserProposalVotes(userAddress)

      get()[sliceKey].setStateByKeys({
        userAddress: userAddress.toLowerCase(),
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
    getUserProposalVotes: async (userAddress: string) => {
      const address = userAddress.toLowerCase()

      set(
        produce((state) => {
          state[sliceKey].userProposalVotesMapper[address] = {
            fetchingState: 'LOADING',
            votes: {},
          }
        })
      )

      try {
        const pagination = 1000
        let page = 1
        let results: { [proposalId: string]: UserProposalVoteData } = {}

        while (true) {
          const ownershipVotesRes = await fetch(
            `https://prices.curve.fi/v1/dao/proposals/votes/user/${address}?pagination=${pagination}&page=${page}`
          )
          const ownershipVotes: UserProposalVotesRes = await ownershipVotesRes.json()

          if (!ownershipVotes.data) {
            break
          }

          ownershipVotes.data.forEach((data) => {
            results[`${data.proposal.vote_id}-${data.proposal.vote_type.toUpperCase()}`] = {
              vote_id: data.proposal.vote_id,
              vote_type: data.proposal.vote_type,
              vote_for: +(data.votes.find((v) => v.supports)?.voting_power ?? 0) / 1e18,
              vote_against: +(data.votes.find((v) => !v.supports)?.voting_power ?? 0) / 1e18,
              vote_open: data.proposal.start_date,
              vote_close: data.proposal.start_date + 640000,
              vote_total_supply: +data.proposal.total_supply / 1e18,
            }
          })

          if (ownershipVotes.data.length < pagination) {
            break
          }
          page++
        }

        set(
          produce((state) => {
            state[sliceKey].userProposalVotesMapper[address] = {
              fetchingState: 'SUCCESS',
              votes: results,
            }
          })
        )
      } catch (error) {
        set(
          produce((state) => {
            state[sliceKey].userProposalVotesMapper[address] = {
              fetchingState: 'ERROR',
              votes: {},
            }
          })
        )
      }
    },
    getUserLocks: async (userAddress: string) => {
      const address = userAddress.toLowerCase()

      set(
        produce((state) => {
          state[sliceKey].userLocksMapper[address] = {
            fetchingState: 'LOADING',
            locks: [],
          }
        })
      )

      try {
        const locksRes = await fetch(`https://prices.curve.fi/v1/dao/locks/${address}`)
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

        set(
          produce((state) => {
            state[sliceKey].userLocksMapper[address] = {
              fetchingState: 'SUCCESS',
              locks: formattedData,
            }
          })
        )
      } catch (error) {
        console.log(error)

        set(
          produce((state) => {
            state[sliceKey].userLocksMapper[address] = {
              fetchingState: 'ERROR',
              locks: [],
            }
          })
        )
      }
    },
    getUserGaugeVotes: async (userAddress: string) => {
      const address = userAddress.toLowerCase()

      set(
        produce((state) => {
          state[sliceKey].userGaugeVotesMapper[address] = {
            fetchingState: 'LOADING',
            votes: [],
          }
        })
      )

      try {
        const gaugeVotesRes = await fetch(`https://prices.curve.fi/v1/dao/gauges/votes/user/${address}`)
        const gaugeVotes: UserGaugeVotesRes = await gaugeVotesRes.json()

        const formattedVotes = gaugeVotes.votes.map((vote) => {
          const gaugeName = vote.gauge_name
            ? vote.gauge_name.replace(/(Curve\.fi |Gauge Deposit)/g, '').trim()
            : vote.gauge_name

          return {
            ...vote,
            gauge_name: gaugeName,
            timestamp: new Date(vote.timestamp).getTime(),
          }
        })

        const sortedVotes = formattedVotes.sort((a, b) => b.weight - a.weight).sort((a, b) => b.timestamp - a.timestamp)

        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesMapper[address] = {
              fetchingState: 'SUCCESS',
              votes: sortedVotes,
            }
          })
        )
      } catch (error) {
        console.error(error)
        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesMapper[address] = {
              fetchingState: 'ERROR',
              votes: [],
            }
          })
        )
      }
    },
    setUserLocksSortBy: (userAddress: string, sortBy: UserLocksSortBy) => {
      const address = userAddress.toLowerCase()

      const {
        userLocksMapper: {
          [address]: { locks },
        },
        userLocksSortBy,
      } = get()[sliceKey]

      let order = userLocksSortBy.order
      if (sortBy === userLocksSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            const reversedEntries = [...locks].reverse()
            state[sliceKey].userLocksMapper[address].locks = reversedEntries
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
            state[sliceKey].userLocksSortBy.key = sortBy
            state[sliceKey].userLocksSortBy.order = 'desc'
            state[sliceKey].userLocksMapper[address].locks = sortedEntries
          })
        )
      }
    },
    setUserProposalVotesSortBy: (userAddress: string, sortBy: UserProposalVotesSortBy) => {
      const address = userAddress.toLowerCase()

      const {
        userProposalVotesMapper: {
          [address]: { votes },
        },
        userProposalVotesSortBy,
      } = get()[sliceKey]

      let order = userProposalVotesSortBy.order

      if (sortBy === userProposalVotesSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'
      } else {
        order = 'desc'
      }

      const sortedEntries = Object.entries(votes).sort(([, a], [, b]) => {
        if (sortBy === 'vote_close') return b.vote_close - a.vote_close
        if (sortBy === 'vote_open') return b.vote_open - a.vote_open
        if (sortBy === 'vote_for') return b.vote_for - a.vote_for
        if (sortBy === 'vote_against') return b.vote_against - a.vote_against
        return b[sortBy] - a[sortBy]
      })

      if (order === 'asc') sortedEntries.reverse()

      const sortedVotes = Object.fromEntries(sortedEntries)

      set(
        produce((state) => {
          state[sliceKey].userProposalVotesSortBy.key = sortBy
          state[sliceKey].userProposalVotesSortBy.order = order
          state[sliceKey].userProposalVotesMapper[address].votes = sortedVotes
        })
      )
    },
    setUserGaugeVotesSortBy: (userAddress: string, sortBy: UserGaugeVotesSortBy) => {
      const address = userAddress.toLowerCase()

      const {
        userGaugeVotesMapper: {
          [address]: { votes },
        },
        userGaugeVotesSortBy,
      } = get()[sliceKey]

      let order = userGaugeVotesSortBy.order
      if (sortBy === userGaugeVotesSortBy.key) {
        order = order === 'asc' ? 'desc' : 'asc'

        set(
          produce((state) => {
            const reversedEntries = [...votes].reverse()
            state[sliceKey].userGaugeVotesMapper[address].votes = reversedEntries
            state[sliceKey].userGaugeVotesSortBy.order = order
          })
        )
      } else {
        const sortedEntries = [...votes].sort((a, b) => {
          return b[sortBy] - a[sortBy]
        })

        set(
          produce((state) => {
            state[sliceKey].userGaugeVotesSortBy.key = sortBy
            state[sliceKey].userGaugeVotesSortBy.order = 'desc'
            state[sliceKey].userGaugeVotesMapper[address].votes = sortedEntries
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
            value: Number(snapshotValue) / 1e18,
            blockNumber: snapshot,
          }
        })
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

export default createUserSlice
