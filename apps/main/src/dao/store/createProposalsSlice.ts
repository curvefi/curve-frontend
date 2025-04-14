import produce from 'immer'
import type { GetState, SetState } from 'zustand'
import { TOP_HOLDERS } from '@/dao/constants'
import { helpers } from '@/dao/lib/curvejs'
import networks from '@/dao/networks'
import type { State } from '@/dao/store/useStore'
import {
  FetchingState,
  PricesProposalResponse,
  ProposalData,
  ProposalListFilter,
  ProposalMapper,
  ProposalType,
  SortByFilterProposals,
  SortDirection,
  TransactionState,
  UserProposalVoteResData,
} from '@/dao/types/dao.types'
import { notify, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { useApiStore } from '@ui-kit/shared/useApiStore'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
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
    getProposal(voteId: number, voteType: ProposalType, silentFetch?: boolean, txHash?: string): void
    getUserProposalVote(userAddress: string, voteId: string, voteType: ProposalType, txHash?: string): void
    setSearchValue(searchValue: string): void
    setActiveFilter(filter: ProposalListFilter): void
    setActiveSortBy(sortBy: SortByFilterProposals): void
    setActiveSortDirection(direction: SortDirection): void
    castVote(voteId: number, voteType: ProposalType, support: boolean): void
    executeProposal(voteId: number, voteType: ProposalType): void
    setStateByKey<T>(key: StateKey, value: T): void
    setStateByKeys(SliceState: Partial<SliceState>): void
    resetState(): void
  }
}

const DEFAULT_STATE: SliceState = {
  proposalLoadingState: 'LOADING',
  voteTxMapper: {},
  executeTxMapper: {},
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'endingSoon',
  activeSortDirection: 'desc',
  proposalMapper: {},
  userProposalVoteMapper: {},
  proposals: [],
}

const createProposalsSlice = (set: SetState<State>, get: GetState<State>): ProposalsSlice => ({
  [sliceKey]: {
    ...DEFAULT_STATE,
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
          console.info('cannot find proposal', data.detail)
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
          }),
        )
      } catch (error) {
        console.warn(error)
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
          console.info('cannot find proposal', data.detail)
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
      const { curve } = useApiStore.getState()
      const { provider } = useWallet.getState()

      const fetchGasInfo = get().gas.fetchGasInfo

      if (!curve || !provider) return

      const { dismiss: dismissConfirm } = notify(t`Please confirm to cast vote.`, 'pending')
      get()[sliceKey].setStateByKey('voteTxMapper', {
        ...get()[sliceKey].voteTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      let dismissNotificationHandler = dismissConfirm

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.warn(error)
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
          const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
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
          notify(successNotificationMessage, 'success', 15000)

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

        console.warn(error)
      }
    },
    executeProposal: async (voteId: number, voteType: ProposalType) => {
      const { curve } = useApiStore.getState()
      const voteIdKey = `${voteId}-${voteType}`

      const { provider } = useWallet.getState()
      const fetchGasInfo = get().gas.fetchGasInfo

      if (!curve || !provider) return

      const { dismiss: dismissConfirm } = notify(t`Please confirm to execute proposal.`, 'pending')
      get()[sliceKey].setStateByKey('executeTxMapper', {
        ...get()[sliceKey].executeTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      let dismissNotificationHandler = dismissConfirm

      try {
        await fetchGasInfo(curve)
      } catch (error) {
        console.warn(error)
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
          const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')
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
          notify(successNotificationMessage, 'success', 15000)

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

        console.warn(error)
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

export default createProposalsSlice
