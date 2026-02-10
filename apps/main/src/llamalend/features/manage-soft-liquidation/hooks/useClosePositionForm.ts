import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type CloseLoanMutation, useClosePositionMutation } from '@/llamalend/mutations/close-position.mutation'
import { useUserState } from '@/llamalend/queries/user-state.query'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { filterFormErrors, useCallbackAfterFormUpdate } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { useCanClose } from './useCanClose'
import { useCollateralToRecover } from './useCollateralToRecover'

const formOptions = {
  ...formDefaultOptions,
  defaultValues: { slippage: SLIPPAGE_PRESETS.STABLE },
} as const

/** Hook to build state for the close-position form */
export function useClosePositionForm({
  market,
  network,
  enabled,
  onClosed,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId; name: string }
  enabled?: boolean
  onClosed?: () => void
}) {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  const form = useForm<CloseLoanMutation>(formOptions)

  const values = watchForm(form)
  const {
    onSubmit,
    isPending: isClosing,
    isSuccess: isClosed,
    error: closeError,
    data,
    reset: resetRepay,
  } = useClosePositionMutation({
    network,
    marketId,
    onClosed,
    onReset: form.reset,
    userAddress,
  })

  useCallbackAfterFormUpdate(form, resetRepay) // reset mutation state on form change

  const userState = useUserState({ chainId, marketId, userAddress }, enabled)
  const collateralToRecover = useCollateralToRecover({ chainId, market })
  const canClose = useCanClose({ chainId, marketId, userAddress })

  const formState = form.formState
  return {
    form,
    values,
    isPending: formState.isSubmitting || isClosing,
    debtToken: mapQuery(userState, ({ debt }) => ({
      chain: network?.id,
      symbol: borrowToken?.symbol,
      address: borrowToken?.address,
      amount: debt,
    })),
    collateralToRecover,
    missing: canClose.data?.missing,
    isDisabled: [userState, collateralToRecover, canClose].some((q) => q.isLoading || q.error),
    isClosed,
    closeError,
    formErrors: useMemo(() => filterFormErrors(formState), [formState]),
    txHash: data?.hash,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
