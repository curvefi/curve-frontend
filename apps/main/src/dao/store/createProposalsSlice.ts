import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import { invalidateProposalPricesApi } from '@/dao/entities/proposal-prices-api'
import { invalidateUserProposalVotesQuery } from '@/dao/entities/user-proposal-votes'
import { helpers } from '@/dao/lib/curvejs'
import { networks } from '@/dao/networks'
import type { State } from '@/dao/store/useStore'
import {
  ProposalListFilter,
  CurveJsProposalType,
  SortByFilterProposals,
  SortDirection,
  TransactionState,
} from '@/dao/types/dao.types'
import type { ProposalType } from '@curvefi/prices-api/proposal'
import { scanTxPath } from '@ui/utils'
import { notify, useWallet, getLib } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

type StateKey = keyof typeof DEFAULT_STATE

type SliceState = {
  voteTxMapper: Record<
    string,
    {
      hash: string | null
      txLink: string | null
      error: string | null
      status: TransactionState
    }
  >
  executeTxMapper: Record<
    string,
    {
      hash: string | null
      txLink: string | null
      error: string | null
      status: TransactionState
    }
  >
  searchValue: string
  activeFilter: ProposalListFilter
  activeSortBy: SortByFilterProposals
  activeSortDirection: SortDirection
}

const SLICE_KEY = 'proposals'

export type ProposalsSlice = {
  [SLICE_KEY]: SliceState & {
    setSearchValue: (searchValue: string) => void
    setActiveFilter: (filter: ProposalListFilter) => void
    setActiveSortBy: (sortBy: SortByFilterProposals) => void
    setActiveSortDirection: (direction: SortDirection) => void
    castVote: (voteId: number, voteType: ProposalType, support: boolean) => Promise<void>
    executeProposal: (voteId: number, voteType: ProposalType) => Promise<void>
    setStateByKey: <T>(key: StateKey, value: T) => void
    setStateByKeys: (SliceState: Partial<SliceState>) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = {
  voteTxMapper: {},
  executeTxMapper: {},
  searchValue: '',
  activeFilter: 'all',
  activeSortBy: 'timeCreated',
  activeSortDirection: 'desc',
}

export const createProposalsSlice = (
  set: StoreApi<State>['setState'],
  get: StoreApi<State>['getState'],
): ProposalsSlice => ({
  [SLICE_KEY]: {
    ...DEFAULT_STATE,
    setSearchValue: filterValue => {
      get()[SLICE_KEY].setStateByKey('searchValue', filterValue)
    },
    setActiveFilter: (filter: ProposalListFilter) => {
      get()[SLICE_KEY].setStateByKey('activeFilter', filter)
    },
    setActiveSortDirection: (direction: SortDirection) => {
      get()[SLICE_KEY].setStateByKey('activeSortDirection', direction)
    },
    setActiveSortBy: (sortBy: SortByFilterProposals) => {
      get()[SLICE_KEY].setStateByKey('activeSortBy', sortBy)
    },
    castVote: async (voteId: number, voteType: ProposalType, support: boolean) => {
      const voteIdKey = `${voteId}-${voteType}`
      const curve = getLib('curveApi')
      const { provider } = useWallet.getState()

      if (!curve || !provider) return

      const { dismiss: dismissConfirm } = notify(t`Please confirm to cast vote.`, 'pending')
      get()[SLICE_KEY].setStateByKey('voteTxMapper', {
        ...get()[SLICE_KEY].voteTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      let dismissNotificationHandler = dismissConfirm

      try {
        const voteResponseHash = await curve.dao.voteForProposal(
          voteType.toUpperCase() as CurveJsProposalType,
          voteId,
          support,
        )

        if (voteResponseHash) {
          get()[SLICE_KEY].setStateByKey('voteTxMapper', {
            ...get()[SLICE_KEY].voteTxMapper,
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

          get()[SLICE_KEY].setStateByKey('voteTxMapper', {
            ...get()[SLICE_KEY].voteTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: voteResponseHash,
              txLink: scanTxPath(networks[1], voteResponseHash),
            },
          })

          await helpers.waitForTransaction(voteResponseHash, provider)

          get()[SLICE_KEY].setStateByKey('voteTxMapper', {
            ...get()[SLICE_KEY].voteTxMapper,
            [voteIdKey]: {
              status: 'SUCCESS',
              hash: voteResponseHash,
              txLink: scanTxPath(networks[1], voteResponseHash),
            },
          })

          dismissDeploying()
          const successNotificationMessage = t`Vote casted successfully!`
          notify(successNotificationMessage, 'success')

          // get new user votes list from api
          const userAddress = curve?.signerAddress
          if (userAddress) {
            await invalidateProposalPricesApi({ proposalId: voteId, proposalType: voteType, txHash: voteResponseHash })
            await invalidateUserProposalVotesQuery({ userAddress })
          }
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[SLICE_KEY].setStateByKey('voteTxMapper', {
          ...get()[SLICE_KEY].voteTxMapper,
          [voteIdKey]: {
            status: 'ERROR',
            hash: null,
            txLink: null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            error: error.message,
          },
        })

        console.warn(error)
      }
    },
    executeProposal: async (voteId: number, voteType: ProposalType) => {
      const curve = getLib('curveApi')
      const voteIdKey = `${voteId}-${voteType}`

      const { provider } = useWallet.getState()

      if (!curve || !provider) return

      const { dismiss: dismissConfirm } = notify(t`Please confirm to execute proposal.`, 'pending')
      get()[SLICE_KEY].setStateByKey('executeTxMapper', {
        ...get()[SLICE_KEY].executeTxMapper,
        [voteIdKey]: {
          status: 'CONFIRMING',
          hash: null,
          txLink: null,
          error: null,
        },
      })

      let dismissNotificationHandler = dismissConfirm

      try {
        const transactionHash = await curve.dao.executeVote(voteType.toUpperCase() as CurveJsProposalType, voteId)

        if (transactionHash) {
          get()[SLICE_KEY].setStateByKey('executeTxMapper', {
            ...get()[SLICE_KEY].executeTxMapper,
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

          get()[SLICE_KEY].setStateByKey('executeTxMapper', {
            ...get()[SLICE_KEY].executeTxMapper,
            [voteIdKey]: {
              status: 'LOADING',
              hash: transactionHash,
              txLink: scanTxPath(networks[1], transactionHash),
              error: null,
            },
          })

          await helpers.waitForTransaction(transactionHash, provider)

          dismissDeploying()
          const successNotificationMessage = t`Proposal executed successfully!`
          notify(successNotificationMessage, 'success')

          // update proposal executed status, forcing api to update by providing a transaction hash
          await invalidateProposalPricesApi({ proposalId: voteId, proposalType: voteType, txHash: transactionHash })

          set(
            produce((state: State) => {
              state[SLICE_KEY].executeTxMapper[voteIdKey] = {
                status: 'SUCCESS',
                hash: transactionHash,
                txLink: scanTxPath(networks[1], transactionHash) ?? null,
                error: null,
              }
            }),
          )
        }
      } catch (error) {
        if (typeof dismissNotificationHandler === 'function') {
          dismissNotificationHandler()
        }

        get()[SLICE_KEY].setStateByKey('executeTxMapper', {
          ...get()[SLICE_KEY].executeTxMapper,
          [voteIdKey]: {
            status: 'ERROR',
            hash: null,
            txLink: null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
            error: error.message,
          },
        })

        console.warn(error)
      }
    },
    setStateByKey: (key, value) => {
      get().setAppStateByKey(SLICE_KEY, key, value)
    },
    setStateByKeys: sliceState => {
      get().setAppStateByKeys(SLICE_KEY, sliceState)
    },
    resetState: () => {
      get().resetAppState(SLICE_KEY, DEFAULT_STATE)
    },
  },
})
