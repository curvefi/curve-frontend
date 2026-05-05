import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useMaxDepositTokenValues } from '@/llamalend/features/supply/hooks/useMaxDeposit'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  depositFormValidationSuite,
  DepositParams,
  type DepositForm,
} from '@/llamalend/queries/validation/supply.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchField } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyDepositForm = (): DepositForm => ({ depositAmount: undefined, maxDepositAmount: undefined })

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

  const form = useForm<DepositForm>({
    ...formDefaultOptions,
    resolver: vestResolver(depositFormValidationSuite),
    defaultValues: emptyDepositForm(),
  })

  const depositAmount = watchField(form, 'depositAmount')

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
    onReset: form.reset,
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
    formErrors: useFormErrors(formState),
    disabledAlert,
    solvencyModal: {
      isOpen,
      onClose,
      onConfirm,
    },
  }
}
