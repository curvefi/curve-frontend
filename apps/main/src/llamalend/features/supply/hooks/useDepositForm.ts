import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useMaxDepositTokenValues } from '@/llamalend/features/supply/hooks/useMaxDeposit'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  type DepositForm,
  depositFormValidationSuite,
  DepositParams,
} from '@/llamalend/queries/validation/supply.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { LlamaMarketType } from '@ui-kit/types/market'

const userDefaultValues = { depositAmount: undefined }

const emptyDepositForm = (): DepositForm => ({ ...userDefaultValues, maxDepositAmount: undefined })

const formOptions = {
  validation: depositFormValidationSuite,
  defaultValues: emptyDepositForm(),
}
export const useDepositForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id
  const marketAlert = useMarketAlert(chainId, getControllerAddress(market), LlamaMarketType.Lend)

  const { borrowToken } = market ? getTokens(market) : {}

  const form = useForm<DepositForm>(formOptions)

  const depositAmount = form.watchValue('depositAmount')
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): DepositParams<ChainId> => ({ chainId, marketId, userAddress, depositAmount }),
      [chainId, marketId, userAddress, depositAmount],
    ),
  )

  const {
    onSubmit: onMutationSubmit,
    isPending: isDepositing,
    error: depositError,
  } = useDepositMutation({
    marketId,
    network,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    onConfirm,
    onClose,
    isOpen,
  } = useFormLowSolvency({
    market,
    chainId,
    onSubmit: onMutationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  const disabledAlert = (marketAlert?.isDepositDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert
  const { formState } = form

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    params,
    isPending,
    isLoading: isPending || !market || isSolvencyLoading,
    onSubmit,
    isDisabled: !!disabledAlert || !formState.isValid || isPending || isDebouncing,
    borrowToken,
    error: depositError ?? solvencyError,
    max: useMaxDepositTokenValues({ params, borrowToken: borrowToken?.address, form }, enabled),
    isApproved: useDepositIsApproved(params, enabled),
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: {
      isOpen,
      onClose,
      onConfirm,
    },
  }
}
