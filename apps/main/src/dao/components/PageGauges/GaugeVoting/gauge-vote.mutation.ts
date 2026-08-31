import { useCallback } from 'react'
import { enforce, test } from 'vest'
import { invalidateUserGaugeVoteNextTimeQuery } from '@/dao/entities/user-gauge-vote-next-time'
import { invalidateUserGaugeWeightVotesQuery } from '@/dao/entities/user-gauge-weight-votes'
import type { ChainId } from '@/dao/types/dao.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { rootKeys } from '@evm-ui/lib/model'
import { useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { curveApiValidationGroup } from '@evm-ui/lib/model/query/curve-api-validation'
import { evmAddressValidationGroup } from '@evm-ui/lib/model/query/evm-address-validation'
import { addressValidationFn, createValidationSuite } from '@evm-ui/lib/validation'
import type { Address, Hex } from '@primitives/address.utils'

type GaugeVoteMutation = {
  gaugeAddress: Address
  voteWeight: number
}

type GaugeVoteValidation = GaugeVoteMutation & {
  chainId: ChainId
  userAddress: Address | undefined
}

const gaugeVoteValidationSuite = createValidationSuite(
  ({ chainId, gaugeAddress, userAddress, voteWeight }: GaugeVoteValidation) => {
    curveApiValidationGroup({ chainId })
    evmAddressValidationGroup({ evmAddress: userAddress })
    test('gaugeAddress', () => addressValidationFn(gaugeAddress))
    test('voteWeight', () => {
      enforce(voteWeight).isNumber()
    })
  },
)

export const useGaugeVoteMutation = ({
  chainId,
  onReset,
  userAddress,
}: {
  chainId: ChainId
  onReset: () => void
  userAddress: Address | undefined
}) => {
  const { mutate, error, isPending } = useTransactionMutation<GaugeVoteMutation>({
    mutationKey: [...rootKeys.userChain({ chainId, userAddress }), 'dao.voteForGauge'] as const,
    mutationFn: async ({ gaugeAddress, voteWeight }) => ({
      hash: (await requireLib('curveApi').dao.voteForGauge(gaugeAddress, voteWeight * 100)) as Hex,
    }),
    validationSuite: gaugeVoteValidationSuite,
    validationParams: { chainId },
    pendingMessage: () => t`Casting vote...`,
    successMessage: () => t`Succesfully cast vote!`,
    onSuccess: async (_data, _receipt, { gaugeAddress }) => {
      await invalidateUserGaugeWeightVotesQuery({ chainId, userAddress })
      await invalidateUserGaugeVoteNextTimeQuery({ chainId, gaugeAddress, userAddress })
    },
    onReset,
  })

  const onSubmit = useCallback((values: GaugeVoteMutation) => mutate(values), [mutate])
  return { onSubmit, error, isPending }
}
