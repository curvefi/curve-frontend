import type { GetState, SetState } from 'zustand'
import type { State } from '@/dao/store/useStore'

import networks from '@/dao/networks'
import { SEVEN_DAYS, TOP_HOLDERS } from '@/dao/constants'
import { helpers } from '@/dao/lib/curvejs'

import Fuse from 'fuse.js'
import orderBy from 'lodash/orderBy'
import produce from 'immer'
import { t } from '@lingui/macro'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  proposalsLoadingState: FetchingState
  filteringProposalsLoading: boolean
  proposalLoadingState: FetchingState
  voteTxMapper: {
    [voteId: string]: {
      hash: string | null
      txLink: string | null
      error: string | null
      status: TransactionState
    }
  }
  executeTxMapper: {
    [voteId: string]: {
      hash: string | null
      txLink: string | null
      error: string | null
      status: TransactionState
    }
  }
  proposalsMapper: { [voteId: string]: ProposalData }
  proposals: ProposalData[]
  proposalMapper: ProposalMapper
  userProposalVoteMapper: {
    [voteId: string]: {
      fetchingState: FetchingState | null
      voted: boolean | null
    }
  }
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilterProposals
  activeSortDirection: SortDirection
}

const sliceKey = 'proposals'

export type ProposalsSlice = {
  [sliceKey]: SliceState & {
    getProposals(): void
    getProposal(voteId: number, voteType: ProposalType, silentFetch?: boolean, txHash?: string): void
    getUserProposalVote(userAddress: string, voteId: string, voteType: ProposalType, txHash?: string): void
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
  proposalLoadingState: 'LOADING',
  voteTxMapper: {},
  executeTxMapper: {},
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'endingSoon',
  activeSortDirection: 'desc',
  proposalMapper: {},
  proposalsMapper: {},
  userProposalVoteMapper: {},
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
            `https://prices.curve.fi/v1/dao/proposals?pagination=${pagination}&page=${page}&status_filter=all&type_filter=all`,
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
    getProposal: async (voteId: number, voteType: ProposalType, silentFetch = false, txHash?: string) => {
      if (!silentFetch) {
        get()[sliceKey].setStateByKey('proposalLoadingState', 'LOADING')
      }

      try {
        const proposal = await fetch(
          `https://prices.curve.fi/v1/dao/proposals/details/${voteType.toLowerCase()}/${voteId}${txHash ? `?tx_hash=${txHash}` : ''}`,
        )
        const data: PricesProposalResponse = await proposal.json()

        // the api returns a detail object if the proposal is not found
        if ('detail' in data) {
          console.log(data.detail)
          return
        }

        const formattedData = {
          ...data,
          votes_for: +data.votes_for / 1e18,
          votes_against: +data.votes_against / 1e18,
          support_required: +data.support_required / 1e18,
          min_accept_quorum: +data.min_accept_quorum / 1e18,
          total_supply: +data.total_supply / 1e18,
          creator_voting_power: +data.creator_voting_power / 1e18,
          votes: data.votes
            .map((vote) => ({
              ...vote,
              topHolder: TOP_HOLDERS[vote.voter.toLowerCase()]?.title ?? null,
              stake: +vote.voting_power / 1e18,
              relativePower: (+vote.voting_power / +data.total_supply) * 100,
            }))
            .sort((a, b) => b.stake - a.stake),
        }

        set(
          produce((state: State) => {
            state[sliceKey].proposalLoadingState = 'SUCCESS'
            state[sliceKey].proposalMapper[`${voteId}-${voteType}`] = formattedData
            state.storeCache.cacheProposalMapper[`${voteId}-${voteType}`] = formattedData
          }),
        )
      } catch (error) {
        console.log(error)
        get()[sliceKey].setStateByKey('proposalLoadingState', 'ERROR')
      }
    },
    // used to check if a user has voted but it has not yet been updated by the API
    getUserProposalVote: async (userAddress: string, voteId: string, voteType: ProposalType, txHash?: string) => {
      const voteIdKey = `${voteId}-${voteType}`

      get()[sliceKey].setStateByKey('userProposalVoteMapper', {
        [voteIdKey]: {
          fetchingState: 'LOADING',
          voted: null,
        },
      })

      try {
        const request = await fetch(
          `https://prices.curve.fi/v1/dao/proposals/vote/user/${userAddress}/${voteType.toLowerCase()}/${voteId}${txHash ? `?tx_hash=${txHash}` : ''}`,
        )
        const data: UserProposalVoteResData = await request.json()

        // the api returns a detail object if the proposal is not found
        if ('detail' in data) {
          console.log(data.detail)
          return
        }

        const proposalData = get()[sliceKey].proposalMapper[`${voteId}-${voteType}`]

        const formattedData = {
          votes_for: +data.proposal.votes_for / 1e18,
          votes_against: +data.proposal.votes_against / 1e18,
          votes: data.votes
            .map((vote) => ({
              ...vote,
              topHolder: TOP_HOLDERS[vote.voter.toLowerCase()]?.title ?? null,
              stake: +vote.voting_power / 1e18,
              relativePower: (+vote.voting_power / +data.proposal.total_supply) * 100,
            }))
            .sort((a, b) => b.stake - a.stake),
        }

        // refresh user votes list
        await get().user.getUserProposalVotes(userAddress)

        get()[sliceKey].setStateByKey('userProposalVoteMapper', {
          [voteIdKey]: {
            fetchingState: 'SUCCESS',
            voted: true,
          },
        })

        set(
          produce((state: State) => {
            state[sliceKey].proposalMapper[`${voteId}-${voteType}`] = {
              ...proposalData,
              ...formattedData,
            }
            state.storeCache.cacheProposalMapper[`${voteId}-${voteType}`] = {
              ...proposalData,
              ...formattedData,
            }
          }),
        )
      } catch (error) {
        get()[sliceKey].setStateByKey('userProposalVoteMapper', {
          [voteIdKey]: {
            fetchingState: 'ERROR',
            voted: false,
          },
        })
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
      const { selectFilteredSortedProposals, activeSortBy, activeSortDirection } = get()[sliceKey]

      const proposals = selectFilteredSortedProposals()

      if (searchValue !== '') {
        const searchFilteredProposals = searchFn(searchValue, proposals)
        const sortedProposals = sortProposals(searchFilteredProposals, activeSortBy, activeSortDirection)

        get()[sliceKey].setStateByKeys({
          filteringProposalsLoading: false,
          proposals: sortedProposals,
        })
        return sortedProposals
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
      const voteIdKey = `${voteId}-${voteType}`
      const { curve } = get()
      const provider = get().wallet.getProvider('')
      const notifyNotification = get().wallet.notifyNotification
      const fetchGasInfo = get().gas.fetchGasInfo

      let dismissNotificationHandler

      if (!curve || !provider) return

      const notifyPendingMessage = t`Please confirm to cast vote.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')
      get()[sliceKey].setStateByKey('voteTxMapper', {
        ...get()[sliceKey].voteTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      dismissNotificationHandler = dismissConfirm

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.log(error)
      }

      try {
        const voteResponseHash = await curve.dao.voteForProposal(voteType, voteId, support)

        if (voteResponseHash) {
          get()[sliceKey].setStateByKey('voteTxMapper', {
            ...get()[sliceKey].voteTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: null,
              txLink: null,
              error: null,
            },
          })

          dismissConfirm()
          const deployingNotificationMessage = t`Casting vote...`
          const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          get()[sliceKey].setStateByKey('voteTxMapper', {
            ...get()[sliceKey].voteTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: voteResponseHash,
              txLink: networks[1].scanTxPath(voteResponseHash),
            },
          })

          await helpers.waitForTransaction(voteResponseHash, provider)

          get()[sliceKey].setStateByKey('voteTxMapper', {
            ...get()[sliceKey].voteTxMapper,
            [voteIdKey]: {
              status: 'SUCCESS',
              hash: voteResponseHash,
              txLink: networks[1].scanTxPath(voteResponseHash),
            },
          })

          dismissDeploying()
          const successNotificationMessage = t`Vote casted successfully!`
          notifyNotification(successNotificationMessage, 'success', 15000)

          // get new user votes list from api
          const userAddress = get().user.userAddress

          if (userAddress) {
            get()[sliceKey].getUserProposalVote(userAddress, voteId.toString(), voteType, voteResponseHash)
          }
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[sliceKey].setStateByKey('voteTxMapper', {
          ...get()[sliceKey].voteTxMapper,
          [voteIdKey]: {
            status: 'ERROR',
            hash: null,
            txLink: null,
            error: error.message,
          },
        })

        console.log(error)
      }
    },
    executeProposal: async (voteId: number, voteType: ProposalType) => {
      const { curve } = get()
      const voteIdKey = `${voteId}-${voteType}`

      const provider = get().wallet.getProvider('')
      const notifyNotification = get().wallet.notifyNotification
      const fetchGasInfo = get().gas.fetchGasInfo

      let dismissNotificationHandler

      if (!curve || !provider) return

      const notifyPendingMessage = t`Please confirm to execute proposal.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')
      get()[sliceKey].setStateByKey('executeTxMapper', {
        ...get()[sliceKey].executeTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      dismissNotificationHandler = dismissConfirm

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.log(error)
      }

      try {
        const transactionHash = await curve.dao.executeVote(voteType, voteId)

        if (transactionHash) {
          get()[sliceKey].setStateByKey('executeTxMapper', {
            ...get()[sliceKey].executeTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: null,
              txLink: null,
              error: null,
            },
          })

          dismissConfirm()
          const deployingNotificationMessage = t`Executing proposal...`
          const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')
          dismissNotificationHandler = dismissDeploying

          get()[sliceKey].setStateByKey('executeTxMapper', {
            ...get()[sliceKey].executeTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: transactionHash,
              txLink: networks[1].scanTxPath(transactionHash),
              error: null,
            },
          })

          await helpers.waitForTransaction(transactionHash, provider)

          dismissDeploying()
          const successNotificationMessage = t`Proposal executed successfully!`
          notifyNotification(successNotificationMessage, 'success', 15000)

          // update proposal executed status, forcing api to update by providing a transaction hash
          await get()[sliceKey].getProposal(voteId, voteType, true, transactionHash)

          set(
            produce((state: State) => {
              state[sliceKey].executeTxMapper[voteIdKey] = {
                status: 'SUCCESS',
                hash: transactionHash,
                txLink: networks[1].scanTxPath(transactionHash),
                error: null,
              }
            }),
          )
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[sliceKey].setStateByKey('executeTxMapper', {
          ...get()[sliceKey].executeTxMapper,
          [voteIdKey]: {
            status: 'ERROR',
            hash: null,
            txLink: null,
            error: error.message,
          },
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
  minSupport: number,
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
  activeSortDirection: SortDirection,
) => {
  if (activeSortBy === 'endingSoon') {
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const activeProposals = proposals.filter((proposal) => proposal.startDate + SEVEN_DAYS > currentTimestamp)
    const passedProposals = orderBy(
      proposals.filter((proposal) => proposal.startDate + SEVEN_DAYS < currentTimestamp),
      ['startDate'],
      ['desc'],
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
    // sort by created time
    return orderBy(proposals, [(proposal) => proposal.startDate], [activeSortDirection])
  }
}

export default createProposalsSlice
