import { useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useStakeMutation } from '@/llamalend/mutations/stake.mutation'
import { useStakeIsApproved } from '@/llamalend/queries/supply/supply-stake-approved.query'
import { type StakeForm, stakeFormValidationSuite, StakeParams } from '@/llamalend/queries/validation/supply.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { useMarketContext } from '../../market-context'
import { useVaultUserBalances } from './useVaultUserBalances'

const userDefaultValues = { stakeAmount: undefined }

const emptyStakeForm = (): StakeForm => ({
  ...userDefaultValues,
  maxStakeAmount: undefined,
})

export const useStakeForm = <ChainId extends LlamaChainId>({ network }: { network: LlamaNetwork<ChainId> }) => {
  const { marketId, controllerAddress, tokens, gaugeAddress, userAddress } = useMarketContext<ChainId>()
  const { chainId } = network
  const marketHasGauge = !!gaugeAddress && gaugeAddress !== zeroAddress
  const marketAlert = useMarketAlert(chainId, controllerAddress, LlamaMarketType.Lend)

  const { borrowToken, collateralToken } = tokens

  const userBalances = useVaultUserBalances({ chainId, marketId, userAddress })
  const maxUserStake = { ...mapQuery(userBalances, d => d.depositedShares), fieldName: 'maxStakeAmount' as const }

  const form = useForm<StakeForm>({
    validation: stakeFormValidationSuite,
    defaultValues: emptyStakeForm(),
  })

  const values = form.watchValues()

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): StakeParams<ChainId> => ({ chainId, marketId, userAddress, stakeAmount: values.stakeAmount }),
      [chainId, marketId, userAddress, values.stakeAmount],
    ),
  )

  const {
    onSubmit: onMutationSubmit,
    isPending: isStaking,
    error: stakeError,
  } = useStakeMutation({ marketId, network, onReset: () => form.reset(userDefaultValues), userAddress })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    onConfirm,
    onClose,
    isOpen,
  } = useFormLowSolvency({
    controllerAddress,
    marketType: LlamaMarketType.Lend,
    chainId,
    onSubmit: onMutationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  useFormSync(form, { maxStakeAmount: maxUserStake.data })

  const disabledAlert = (marketAlert?.isDepositDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert
  const { formState } = form
  const isPending = formState.isSubmitting || isStaking
  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || !marketId || isSolvencyLoading,
    onSubmit,
    isDisabled: !!disabledAlert || !formState.isValid || !marketHasGauge || isPending || isDebouncing,
    borrowToken,
    collateralToken,
    error: stakeError ?? solvencyError,
    max: maxUserStake,
    isApproved: useStakeIsApproved(params),
    hasGauge: marketHasGauge,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: {
      isOpen,
      onClose,
      onConfirm,
    },
  }
}
