import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import networks from '@/networks'

import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'
import { t } from '@lingui/macro'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoadingState: FetchingState
  filteringProposalsLoading: boolean
  curveJsProposalLoadingState: FetchingState
  voteTx: {
    hash: string | null
    txLink: string | null
    error: string | null
    status: '' | 'CONFIRMING' | 'LOADING' | 'SUCCESS' | 'ERROR'
  }
  proposalsMapper: { [voteId: string]: ProposalData }
  proposals: ProposalData[]
  curveJsProposalMapper: { [proposalId: string]: CurveJsProposalData }
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilterProposals
  activeSortDirection: ActiveSortDirection
}

const sliceKey = 'proposals'

export type ProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(curve: CurveApi): void
    getProposal(curve: CurveApi, voteId: number, voteType: 'PARAMETER' | 'OWNERSHIP'): void
    setSearchValue(searchValue: string): void
    setActiveFilter(filter: ProposalListFilter): void
    setActiveSortBy(sortBy: SortByFilterProposals): void
    setActiveSortDirection(direction: ActiveSortDirection): void
    selectFilteredSortedProposals(): ProposalData[]
    setProposals(searchValue: string): void
    castVote(voteId: number, voteType: ProposalType, support: boolean): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalsLoadingState: 'LOADING',
  filteringProposalsLoading: true,
  curveJsProposalLoadingState: 'LOADING',
  voteTx: {
    hash: null,
    txLink: null,
    error: null,
    status: '',
  },
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'voteId',
  activeSortDirection: 'desc',
  curveJsProposalMapper: {},
  proposalsMapper: {},
  proposals: [],
}

const createProposalsSlice = (set: SetState<State>, get: GetState<State>): ProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getProposals: async (curve: CurveApi) => {
      const { proposalsMapper } = get()[sliceKey]
      const { cacheProposalsMapper } = get().storeCache

      if (Object.keys(proposalsMapper).length === 0 && Object.keys(cacheProposalsMapper).length === 0) {
        get()[sliceKey].setStateByKey('proposalsLoadingState', 'LOADING')
      }

      try {
        const proposals = await curve.dao.getProposalList()

        let proposalsObject: { [voteId: string]: ProposalData } = {}

        for (const proposal of proposals) {
          const minAcceptQuorumPercent = convertNumberEighteen(+proposal.minAcceptQuorum) * 100
          const totalVeCrv = convertNumberEighteen(+proposal.totalSupply)
          const quorumVeCrv = (minAcceptQuorumPercent / 100) * totalVeCrv
          const votesFor = convertNumberEighteen(+proposal.votesFor)
          const votesAgainst = convertNumberEighteen(+proposal.votesAgainst)
          const currentQuorumPercentage = (votesFor / totalVeCrv) * 100

          const status = getProposalStatus(proposal.startDate, quorumVeCrv, votesFor, votesAgainst)

          proposalsObject[`${proposal.voteId}-${proposal.voteType}`] = {
            ...proposal,
            status: status,
            votesFor,
            votesAgainst,
            minSupport: convertNumberTen(+proposal.supportRequired),
            minAcceptQuorumPercent,
            quorumVeCrv,
            totalVeCrv,
            totalVotes: votesFor + votesAgainst,
            currentQuorumPercentage,
          }
        }

        get()[sliceKey].setStateByKey('proposalsMapper', proposalsObject)
        get().storeCache.setStateByKey('cacheProposalsMapper', proposalsObject)
        get()[sliceKey].setStateByKey('proposalsLoadingState', 'SUCCESS')
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('proposalsLoadingState', 'ERROR')
      }
    },
    getProposal: async (curve: CurveApi, voteId: number, voteType: 'PARAMETER' | 'OWNERSHIP') => {
      get()[sliceKey].setStateByKey('curveJsProposalLoadingState', 'LOADING')

      try {
        const proposal = await curve.dao.getProposal(voteType, voteId)

        const formattedVotes = proposal.votes
          .map((vote) => ({
            ...vote,
            stake: convertNumberEighteen(vote.stake),
            relativePower: (vote.stake / +proposal.totalSupply) * 100,
          }))
          .sort()
        const sortedVotes = formattedVotes.sort((a, b) => b.stake - a.stake)

        set(
          produce((state: State) => {
            state[sliceKey].curveJsProposalLoadingState = 'SUCCESS'
            state[sliceKey].curveJsProposalMapper[`${voteId}-${voteType}`] = {
              ...proposal,
              votes: sortedVotes,
            }
            state.storeCache.cacheCurveJsProposalMapper[`${voteId}-${voteType}`] = {
              ...proposal,
              votes: sortedVotes,
            }
          })
        )
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('curveJsProposalLoadingState', 'ERROR')
      }
    },
    selectFilteredSortedProposals: () => {
      const { proposalsMapper, activeSortBy, activeSortDirection, activeFilter } = get()[sliceKey]
      const cacheProposalsMapper = get().storeCache.cacheProposalsMapper

      const proposalsData = proposalsMapper ?? cacheProposalsMapper
      const proposals = Object.values(proposalsData)

      const filteredProposals = filterProposals(proposals, activeFilter)
      const sortedProposals = sortProposals(filteredProposals, activeSortBy, activeSortDirection)

      return sortedProposals
    },
    setProposals: (searchValue: string) => {
      const { selectFilteredSortedProposals } = get()[sliceKey]
      // get()[sliceKey].setStateByKey('filteringProposalsLoading', true)

      const proposals = selectFilteredSortedProposals()

      if (searchValue !== '') {
        const searchFilteredProposals = searchFn(searchValue, proposals)
        get()[sliceKey].setStateByKeys({
          filteringProposalsLoading: false,
          proposals: searchFilteredProposals,
        })
        return searchFilteredProposals
      }

      get()[sliceKey].setStateByKeys({
        filteringProposalsLoading: false,
        proposals: proposals,
      })
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
    setActiveSortBy: (sortBy: SortByFilterProposals) => {
      get()[sliceKey].setStateByKey('activeSortBy', sortBy)
    },
    castVote: async (voteId: number, voteType: ProposalType, support: boolean) => {
      const { curve } = get()
      const provider = get().wallet.provider
      const notifyNotification = get().wallet.notifyNotification
      const fetchGasInfo = get().gas.fetchGasInfo

      let dismissNotificationHandler

      if (!curve || !provider) return

      const notifyPendingMessage = t`Please confirm to cast vote.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')
      get()[sliceKey].setStateByKey('voteTx', {
        ...get()[sliceKey].voteTx,
        status: 'CONFIRMING',
      })

      dismissNotificationHandler = dismissConfirm

      // refresh user votes list
      const onboard = get().wallet.onboard
      if (onboard) {
        const connectedWallets = onboard.state.get().wallets
        if (connectedWallets.length > 0) {
          get().user.updateUserData(curve, connectedWallets[0])
        }
      }

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.log(error)
      }

      try {
        const voteResponseHash = await curve.dao.voteForProposal(voteType, voteId, support)

        if (voteResponseHash) {
          get()[sliceKey].setStateByKey('voteTx', {
            ...get()[sliceKey].voteTx,
            status: 'LOADING',
          })

          dismissConfirm()
          const deployingNotificationMessage = t`Casting vote...`
          const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          get()[sliceKey].setStateByKey('voteTx', {
            ...get()[sliceKey].voteTx,
            hash: voteResponseHash,
            txLink: networks[1].scanTxPath(voteResponseHash),
          })
          const receipt = await provider.waitForTransactionReceipt(voteResponseHash)
          if (receipt.status === 1) {
            get()[sliceKey].setStateByKey('voteTx', {
              ...get()[sliceKey].voteTx,
              status: 'SUCCESS',
            })

            dismissDeploying()
            const successNotificationMessage = t`Vote casted successfully.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          }
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[sliceKey].setStateByKey('voteTx', {
          ...get()[sliceKey].voteTx,
          status: 'ERROR',
          error: error.message,
        })

        console.log(error)
      }
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

const convertNumberEighteen = (number: number) => {
  return number / 10 ** 18
}

const convertNumberTen = (number: number) => {
  return number / 10 ** 10
}

const searchFn = (filterValue: string, proposals: ProposalData[]) => {
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

  return result.map((r) => r.item)
}

const filterProposals = (proposals: ProposalData[], activeFilter: ProposalListFilter) => {
  if (activeFilter === 'all') {
    return proposals
  }
  return proposals.filter((proposal) => proposal.status.toLowerCase() === activeFilter)
}

const sortProposals = (
  proposals: ProposalData[],
  activeSortBy: SortByFilterProposals,
  activeSortDirection: ActiveSortDirection
) => {
  if (activeSortBy === 'endingSoon') {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const activeProposals = proposals.filter((proposal) => proposal.startDate + 604800 > currentTimestamp)
    const passedProposals = orderBy(
      proposals.filter((proposal) => proposal.startDate + 604800 < currentTimestamp),
      ['voteId'],
      ['desc']
    )

    if (activeSortDirection === 'asc') {
      return [
        ...orderBy(activeProposals, [(proposal) => proposal.startDate + 604800 - currentTimestamp], ['desc']),
        ...passedProposals,
      ]
    } else {
      return [
        ...orderBy(activeProposals, [(proposal) => proposal.startDate + 604800 - currentTimestamp], ['asc']),
        ...passedProposals,
      ]
    }
  } else {
    return orderBy(proposals, [activeSortBy], [activeSortDirection])
  }
}

export default createProposalsSlice
