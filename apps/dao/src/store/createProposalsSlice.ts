import type { GetState, SetState } from 'zustand'
import type { State } from '@/store/useStore'

import networks from '@/networks'
import { SEVEN_DAYS, TOP_HOLDERS } from '@/constants'

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
  executeTx: {
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
  activeSortDirection: SortDirection
}

const sliceKey = 'proposals'

export type ProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(): void
    getProposal(curve: CurveApi, voteId: number, voteType: 'PARAMETER' | 'OWNERSHIP'): void
    setSearchValue(searchValue: string): void
    setActiveFilter(filter: ProposalListFilter): void
    setActiveSortBy(sortBy: SortByFilterProposals): void
    setActiveSortDirection(direction: SortDirection): void
    selectFilteredSortedProposals(): ProposalData[]
    setProposals(searchValue: string): void
    castVote(voteId: number, voteType: ProposalType, support: boolean): void
    executeProposal(voteId: number, voteType: ProposalType): void
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
  executeTx: {
    hash: null,
    txLink: null,
    error: null,
    status: '',
  },
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'endingSoon',
  activeSortDirection: 'desc',
  curveJsProposalMapper: {},
  proposalsMapper: {},
  proposals: [],
}

const createProposalsSlice = (set: SetState<State>, get: GetState<State>): ProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
    getProposals: async () => {
      const { proposalsMapper } = get()[sliceKey]
      const { cacheProposalsMapper } = get().storeCache

      if (Object.keys(proposalsMapper).length === 0 && Object.keys(cacheProposalsMapper).length === 0) {
        get()[sliceKey].setStateByKey('proposalsLoadingState', 'LOADING')
      }

      try {
        let page = 1
        const pagination = 500
        let results: PricesProposalResponseData[] = []

        while (true) {
          const proposalsRes = await fetch(
            `https://prices.curve.fi/v1/dao/proposals?pagination=${pagination}&page=${page}&status_filter=all&type_filter=all`
          )
          const data: PricesProposalsResponse = await proposalsRes.json()
          results = results.concat(data.proposals)
          if (data.proposals.length < pagination) {
            break
          }
          page++
        }

        let proposalsObject: { [voteId: string]: ProposalData } = {}

        for (const proposal of results) {
          const minAcceptQuorumPercent = (+proposal.min_accept_quorum / 1e18) * 100
          const minSupport = (+proposal.support_required / 1e18) * 100
          const totalVeCrv = +proposal.total_supply / 1e18
          const quorumVeCrv = (minAcceptQuorumPercent / 100) * totalVeCrv
          const votesFor = +proposal.votes_for / 1e18
          const votesAgainst = +proposal.votes_against / 1e18
          const currentQuorumPercentage = (votesFor / totalVeCrv) * 100

          const status = getProposalStatus(proposal.start_date, quorumVeCrv, votesFor, votesAgainst, minSupport)

          proposalsObject[`${proposal.vote_id}-${proposal.vote_type.toUpperCase()}`] = {
            voteId: proposal.vote_id,
            voteType: proposal.vote_type.toUpperCase() as ProposalType,
            creator: proposal.creator,
            startDate: proposal.start_date,
            metadata: proposal.metadata,
            executed: proposal.executed,
            status,
            votesFor,
            votesAgainst,
            minSupport,
            minAcceptQuorumPercent,
            quorumVeCrv,
            totalVeCrv,
            totalVotes: votesFor + votesAgainst,
            currentQuorumPercentage,
            totalSupply: proposal.total_supply,
            snapshotBlock: proposal.snapshot_block,
            ipfsMetadata: proposal.ipfs_metadata,
            voteCount: proposal.vote_count,
            supportRequired: proposal.support_required,
            minAcceptQuorum: proposal.min_accept_quorum,
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
            topHolder: TOP_HOLDERS[vote.voter.toLowerCase()]?.title ?? null,
            stake: vote.stake / 1e18,
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
    setActiveSortDirection: (direction: SortDirection) => {
      get()[sliceKey].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilterProposals) => {
      get()[sliceKey].setStateByKey('activeSortBy', sortBy)
    },
    castVote: async (voteId: number, voteType: ProposalType, support: boolean) => {
      const { curve } = get()
      const provider = get().wallet.getProvider('')
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
    executeProposal: async (voteId: number, voteType: ProposalType) => {
      const { curve } = get()

      const provider = get().wallet.getProvider('')
      const notifyNotification = get().wallet.notifyNotification
      const fetchGasInfo = get().gas.fetchGasInfo

      let dismissNotificationHandler

      if (!curve || !provider) return

      const notifyPendingMessage = t`Please confirm to execute proposal.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')
      get()[sliceKey].setStateByKey('executeTx', {
        ...get()[sliceKey].executeTx,
        status: 'CONFIRMING',
      })

      dismissNotificationHandler = dismissConfirm

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.log(error)
      }

      try {
        const voteResponseHash = await curve.dao.executeVote(voteType, voteId)

        if (voteResponseHash) {
          get()[sliceKey].setStateByKey('executeTx', {
            ...get()[sliceKey].executeTx,
            status: 'LOADING',
          })

          dismissConfirm()
          const deployingNotificationMessage = t`Executing proposal...`
          const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          get()[sliceKey].setStateByKey('executeTx', {
            ...get()[sliceKey].executeTx,
            hash: voteResponseHash,
            txLink: networks[1].scanTxPath(voteResponseHash),
          })
          const receipt = await provider.waitForTransactionReceipt(voteResponseHash)
          if (receipt.status === 1) {
            get()[sliceKey].setStateByKey('executeTx', {
              ...get()[sliceKey].executeTx,
              status: 'SUCCESS',
            })

            dismissDeploying()
            const successNotificationMessage = t`Proposal executed successfully.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          }
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[sliceKey].setStateByKey('executeTx', {
          ...get()[sliceKey].executeTx,
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

const getProposalStatus = (
  startDate: number,
  quorumVeCrv: number,
  votesFor: number,
  votesAgainst: number,
  minSupport: number
) => {
  const totalVotes = votesFor + votesAgainst
  const passedQuorum = votesFor >= quorumVeCrv
  const passedMinimum = (votesFor / totalVotes) * 100 > minSupport

  if (startDate + SEVEN_DAYS > Math.floor(Date.now() / 1000)) return 'Active'
  if (passedQuorum && passedMinimum) return 'Passed'
  return 'Denied'
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

  const result = fuse.search(filterValue)

  return result.map((r) => r.item)
}

const filterProposals = (proposals: ProposalData[], activeFilter: ProposalListFilter) => {
  if (activeFilter === 'all') {
    return proposals
  }
  if (activeFilter === 'executable') {
    return proposals.filter((proposal) => proposal.status === 'Passed' && !proposal.executed)
  }
  return proposals.filter((proposal) => proposal.status.toLowerCase() === activeFilter)
}

const sortProposals = (
  proposals: ProposalData[],
  activeSortBy: SortByFilterProposals,
  activeSortDirection: SortDirection
) => {
  if (activeSortBy === 'endingSoon') {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const activeProposals = proposals.filter((proposal) => proposal.startDate + SEVEN_DAYS > currentTimestamp)
    const passedProposals = orderBy(
      proposals.filter((proposal) => proposal.startDate + SEVEN_DAYS < currentTimestamp),
      ['voteId'],
      ['desc']
    )

    if (activeSortDirection === 'asc') {
      return [
        ...orderBy(activeProposals, [(proposal) => proposal.startDate + SEVEN_DAYS - currentTimestamp], ['desc']),
        ...passedProposals,
      ]
    } else {
      return [
        ...orderBy(activeProposals, [(proposal) => proposal.startDate + SEVEN_DAYS - currentTimestamp], ['asc']),
        ...passedProposals,
      ]
    }
  } else {
    return orderBy(proposals, [activeSortBy], [activeSortDirection])
  }
}

export default createProposalsSlice
