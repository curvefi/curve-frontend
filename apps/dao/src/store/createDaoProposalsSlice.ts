import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import cloneDeep from 'lodash/cloneDeep'

import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoading: boolean
  proposals: ProposalData[]
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilter
  activeSortDirection: ActiveSortDirection
}

const sliceKey = 'daoProposals'

// prettier-ignore
export type DaoProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(curve: CurveApi): void
    setActiveFilter: (filter: ProposalListFilter) => void
    setActiveSortBy: (sortBy: SortByFilter) => void
    setActiveSortDirection: (direction: ActiveSortDirection) => void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalsLoading: false,
  activeFilter: 'all',
  activeSortBy: 'voteId',
  activeSortDirection: 'asc',
  proposals: [],
}

// units of gas used * (base fee + priority fee)
// estimatedGas * (base fee * maxPriorityFeePerGas)

const createDaoProposalsSlice = (set: SetState<State>, get: GetState<State>): DaoProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getProposals: async (curve: CurveApi) => {
      set(
        produce((state: State) => {
          state[sliceKey].proposalsLoading = true
        })
      )

      try {
        const proposals = await curve.dao.getProposalList()

        const formattedProposals: ProposalData[] = proposals.map((proposal) => {
          const minAcceptQuorumPercent = converNumber(+proposal.minAcceptQuorum)
          const totalVeCrv = converNumber(+proposal.totalSupply)
          const quorumVeCrv = minAcceptQuorumPercent * totalVeCrv
          const votesFor = converNumber(+proposal.votesFor)
          const votesAgainst = converNumber(+proposal.votesAgainst)

          const status = getProposalStatus(proposal.startDate, quorumVeCrv, votesFor, votesAgainst)

          return {
            ...proposal,
            status: status,
          }
        })

        set(
          produce((state: State) => {
            state[sliceKey].proposals = formattedProposals
            state[sliceKey].proposalsLoading = false
          })
        )
      } catch (error) {
        console.log(error)
      }
    },
    setActiveFilter: (filter: ProposalListFilter) => {
      set(
        produce((state: State) => {
          state[sliceKey].activeFilter = filter
        })
      )
    },
    setActiveSortDirection: (direction: ActiveSortDirection) => {
      set(
        produce((state: State) => {
          state[sliceKey].activeSortDirection = direction
        })
      )
    },
    setActiveSortBy: (sortBy: SortByFilter) => {
      set(
        produce((state: State) => {
          state[sliceKey].activeSortBy = sortBy
        })
      )
    },
    resetState: () => {
      get().resetAppState(sliceKey, cloneDeep(DEFAULT_STATE))
    },
  },
})

const getProposalStatus = (startDate: number, quorumVeCrv: number, votesFor: number, votesAgainst: number) => {
  const totalVotes = votesFor + votesAgainst
  const passedQuorum = totalVotes >= quorumVeCrv

  if (startDate + 604800 > Math.floor(Date.now() / 1000)) return 'Active'
  if (passedQuorum && votesFor > votesAgainst) return 'Passed'
  return 'Denied'
}

const converNumber = (number: number) => {
  return number / 10 ** 18
}

export default createDaoProposalsSlice
