import { useCallback } from 'react'
import { enforce, test } from 'vest'
import { invalidateProposalPricesApi } from '@/dao/entities/proposal-prices-api'
import { invalidateUserProposalVotesQuery } from '@/dao/entities/user-proposal-votes'
import type { CurveJsProposalType } from '@/dao/types/dao.types'
import type { ProposalType } from '@curvefi/prices-api/proposal'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { type OnTransactionSuccess, useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { createValidationSuite } from '@evm-ui/lib/validation'
import type { Hex } from '@primitives/address.utils'

const resetFormlessMutation = () => undefined

type ProposalVoteMutation = {
  proposalId: number
  proposalType: ProposalType
  /** True casts a "for" vote; false casts an "against" vote. */
  support: boolean
}

type ProposalExecuteMutation = {
  proposalId: number
  proposalType: ProposalType
}

type ProposalValidation = {
  chainId: number
  proposalId: number
  userAddress: string | undefined
}

const validateProposal = ({ chainId, proposalId, userAddress }: ProposalValidation) => {
  curveApiValidationGroup({ chainId })
  evmAddressValidationGroup({ evmAddress: userAddress })
  test('proposalId', () => {
    enforce(proposalId).isPositive()
  })
}

const proposalVoteValidationSuite = createValidationSuite(
  ({ support, ...params }: ProposalValidation & ProposalVoteMutation) => {
    validateProposal(params)
    test('support', () => {
      enforce(support).isBoolean()
    })
  },
)

const proposalExecuteValidationSuite = createValidationSuite(validateProposal)

export const useProposalVoteMutation = ({
  chainId,
  userAddress,
  onVoted,
}: {
  chainId: number
  userAddress: string | undefined
  onVoted?: OnTransactionSuccess<ProposalVoteMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<ProposalVoteMutation>({
    mutationKey: [...rootKeys.user({ userAddress }), 'dao.voteForProposal'] as const,
    mutationFn: async ({ proposalId, proposalType, support }) => ({
      hash: (await requireLib('curveApi').dao.voteForProposal(
        proposalType.toUpperCase() as CurveJsProposalType,
        proposalId,
        support,
      )) as Hex,
    }),
    validationSuite: proposalVoteValidationSuite,
    validationParams: { chainId },
    pendingMessage: () => t`Casting vote...`,
    successMessage: () => t`Vote casted successfully!`,
    onSuccess: async (data, receipt, variables, context) => {
      await invalidateProposalPricesApi({
        proposalId: variables.proposalId,
        proposalType: variables.proposalType,
        txHash: data.hash,
      })
      await invalidateUserProposalVotesQuery({ userAddress: context.wallet.address })
      await onVoted?.(data, receipt, variables, context)
    },
    onReset: resetFormlessMutation,
  })

  const onSubmit = useCallback((values: ProposalVoteMutation) => mutate(values), [mutate])
  return { onSubmit, error, isPending }
}

export const useProposalExecuteMutation = ({
  chainId,
  userAddress,
  onExecuted,
}: {
  chainId: number
  userAddress: string | undefined
  onExecuted?: OnTransactionSuccess<ProposalExecuteMutation>
}) => {
  const { mutate, error, isPending } = useTransactionMutation<ProposalExecuteMutation>({
    mutationKey: [...rootKeys.user({ userAddress }), 'dao.executeVote'] as const,
    mutationFn: async ({ proposalId, proposalType }) => ({
      hash: (await requireLib('curveApi').dao.executeVote(
        proposalType.toUpperCase() as CurveJsProposalType,
        proposalId,
      )) as Hex,
    }),
    validationSuite: proposalExecuteValidationSuite,
    validationParams: { chainId },
    pendingMessage: () => t`Executing proposal...`,
    successMessage: () => t`Proposal executed successfully!`,
    onSuccess: async (data, receipt, variables, context) => {
      await invalidateProposalPricesApi({
        proposalId: variables.proposalId,
        proposalType: variables.proposalType,
        txHash: data.hash,
      })
      await onExecuted?.(data, receipt, variables, context)
    },
    onReset: resetFormlessMutation,
  })

  const onSubmit = useCallback((values: ProposalExecuteMutation) => mutate(values), [mutate])
  return { onSubmit, error, isPending }
}
