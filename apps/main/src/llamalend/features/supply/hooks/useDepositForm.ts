import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMaxDepositTokenValues } from '@/llamalend/features/supply/hooks/useMaxDeposit'
import { getTokens } from '@/llamalend/llama.utils'
import type { FormDisabledAlert, LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import {
  depositFormValidationSuite,
  DepositParams,
  type DepositForm,
} from '@/llamalend/queries/validation/supply.validation'
import { useLowSolvencyForm } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyForm'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchField } from '@ui-kit/lib/model'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'

const emptyDepositForm = (): DepositForm => ({ depositAmount: undefined, maxDepositAmount: undefined })

export const useDepositForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  depositDisabledAlert,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  depositDisabledAlert?: FormDisabledAlert
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

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
    onSubmit,
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
    handleSubmit,
    handleConfirmLowSolvencyModal,
    closeLowSolvencyModal,
    isLowSolvencyModalOpen,
  } = useLowSolvencyForm({
    market,
    chainId,
    onSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  const disabledAlert = depositDisabledAlert ?? solvencyDisabledAlert
  const { formState } = form

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    params,
    isPending,
    isLoading: isPending || !market || isSolvencyLoading,
    onSubmit: handleSubmit,
    isDisabled: !!disabledAlert || !!solvencyError || !formState.isValid || isPending || isDebouncing,
    borrowToken,
    error: depositError ?? solvencyError,
    max: useMaxDepositTokenValues({ params, borrowToken: borrowToken?.address, form }, enabled),
    isApproved: useDepositIsApproved(params, enabled),
    formErrors: useFormErrors(formState),
    disabledAlert,
    lowSolvencyModalProps: {
      action: 'deposit',
      onClose: closeLowSolvencyModal,
      onConfirm: handleConfirmLowSolvencyModal,
      open: isLowSolvencyModalOpen,
      tokenSymbol: borrowToken?.symbol,
    } as const,
  }
}
