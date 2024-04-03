import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'
import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoading: boolean
  proposals: ProposalData[]
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilter
  activeSortDirection: ActiveSortDirection
}

const sliceKey = 'daoProposals'

// prettier-ignore
export type DaoProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(curve: CurveApi): void
    setSearchValue(searchValue: string): void
    setActiveFilter(filter: ProposalListFilter): void
    setActiveSortBy(sortBy: SortByFilter): void
    setActiveSortDirection(direction: ActiveSortDirection): void
    selectFilteredProposals(): ProposalData[]
    selectSortedProposals(): ProposalData[]
    selectSearchFilteredProposals(): ProposalData[]
    selectProposals(): ProposalData[]
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalsLoading: false,
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'voteId',
  activeSortDirection: 'desc',
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
          const minAcceptQuorumPercent = converNumber(+proposal.minAcceptQuorum) * 100
          const totalVeCrv = converNumber(+proposal.totalSupply)
          const quorumVeCrv = (minAcceptQuorumPercent / 100) * totalVeCrv
          const votesFor = converNumber(+proposal.votesFor)
          const votesAgainst = converNumber(+proposal.votesAgainst)

          const status = getProposalStatus(proposal.startDate, quorumVeCrv, votesFor, votesAgainst)

          return {
            ...proposal,
            status: status,
            votesFor,
            votesAgainst,
            minAcceptQuorumPercent,
            quorumVeCrv,
            totalVeCrv,
            totalVotes: votesFor + votesAgainst,
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
    selectFilteredProposals: () => {
      const { proposals, activeFilter } = get()[sliceKey]

      if (activeFilter === 'all') return proposals

      return proposals.filter((proposal) => proposal.status.toLowerCase() === activeFilter)
    },
    selectSortedProposals: () => {
      const { proposals, activeSortBy, activeSortDirection, activeFilter, selectFilteredProposals } = get()[sliceKey]

      let proposalsCopy = [...proposals]

      if (activeFilter !== 'all') {
        proposalsCopy = selectFilteredProposals()
      }

      let sortedProposals = proposalsCopy
      let passedProposals = []
      if (activeSortBy === 'endingSoon') {
        // causes timestamp to not be in sync with other proposal countdowns
        const currentTimestamp = Math.floor(Date.now() / 1000)
        sortedProposals = proposalsCopy.filter((proposal) => proposal.startDate + 604800 > currentTimestamp)
        passedProposals = orderBy(
          proposalsCopy.filter((proposal) => proposal.startDate + 604800 < currentTimestamp),
          ['voteId'],
          ['desc']
        )

        if (activeSortDirection === 'asc') {
          sortedProposals = orderBy(
            sortedProposals,
            [(proposal) => proposal.startDate + 604800 - currentTimestamp],
            ['desc']
          )
          sortedProposals = [...sortedProposals, ...passedProposals]
        } else {
          sortedProposals = orderBy(
            sortedProposals,
            [(proposal) => proposal.startDate + 604800 - currentTimestamp],
            ['asc']
          )
          sortedProposals = [...sortedProposals, ...passedProposals]
        }
      } else {
        sortedProposals = orderBy(proposalsCopy, [activeSortBy], [activeSortDirection])
      }

      return sortedProposals
    },
    selectSearchFilteredProposals: () => {
      const { selectSortedProposals, searchValue } = get()[sliceKey]

      const proposals = selectSortedProposals()

      return searchFn(searchValue, proposals)
    },
    selectProposals: () => {
      const { selectSearchFilteredProposals, searchValue, selectSortedProposals } = get()[sliceKey]

      if (searchValue !== '') {
        return selectSearchFilteredProposals()
      }

      return selectSortedProposals()
    },
    setSearchValue: (filterValue) => {
      get()[sliceKey].setStateByKey('searchValue', filterValue)
    },
    setActiveFilter: (filter: ProposalListFilter) => {
      get()[sliceKey].setStateByKey('activeFilter', filter)
    },
    setActiveSortDirection: (direction: ActiveSortDirection) => {
      get()[sliceKey].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilter) => {
      get()[sliceKey].setStateByKey('activeSortBy', sortBy)
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

const searchFn = (filterValue: string, proposals: ProposalData[]) => {
  console.log('searching', filterValue)

  const fuse = new Fuse<ProposalData>(proposals, {
    ignoreLocation: true,
    threshold: 0.3,
    includeScore: true,
    keys: [
      'voteId',
      'creator',
      'voteType',
      {
        name: 'metaData',
        getFn: (proposal) => {
          // Preprocess the metaData field
          const metaData = proposal.metadata || ''
          return metaData.toLowerCase()
        },
      },
    ],
  })

  const result = fuse.search(filterValue, { limit: 10 })

  console.log('result', result)

  return result.map((r) => r.item)
}

export default createDaoProposalsSlice
