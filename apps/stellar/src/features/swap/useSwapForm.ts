import { useMemo } from 'react'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useSwapMutation } from '@/stellar/mutations/swap.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { swapFormValidationSuite } from '@/stellar/queries/validation/swap.validation'
import { maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { useSwapPreview } from './useSwapPreview'

const userDefaultValues = { inputAmount: undefined, outputAmount: undefined, editedSide: 'pay' } as const
const formOptions = {
  validation: swapFormValidationSuite,
  defaultValues: {
    ...userDefaultValues,
    fromIndex: 0,
    toIndex: 1,
    decimals: undefined,
    maxAmount: undefined,
    maxOutput: undefined,
    minimum: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

export function useSwapForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const reserves = usePoolReserves(poolParams)
  const tokens = mapQuery(config, config => config.tokens)
  const { inputs: tokenInputs, decimals, maxAmounts } = usePoolTokens({ ...poolParams, account, tokens })
  const slippage = useUserProfileStore(state => state.maxSlippage.stable)
  const form = useForm<SwapFormValues>(formOptions)
  const { formState, reset } = form
  const values = form.watchValues()
  const { fromIndex, toIndex, editedSide } = values
  const maxAmount = maxAmounts.data?.[fromIndex]
  const maxOutput = maybes([reserves.data?.[toIndex], decimals.data?.[toIndex]], fromWei)

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
        network,
        pool,
        account,
        inputAmount: values.inputAmount,
        outputAmount: values.outputAmount,
        fromIndex,
        toIndex,
        editedSide,
        decimals: decimals.data,
        maxAmount,
        maxOutput,
        slippage,
      }),
      [
        network,
        pool,
        account,
        values.inputAmount,
        values.outputAmount,
        fromIndex,
        toIndex,
        editedSide,
        decimals.data,
        maxAmount,
        maxOutput,
        slippage,
      ],
    ),
    userDefaultValues,
  )

  const preview = useSwapPreview(params)

  const { inputAmount, outputAmount, minimum, gas } = preview
  useFormSync(form, { decimals: decimals.data, maxAmount, maxOutput, slippage, minimum: minimum.data })
  useFormSync(form, { inputAmount: inputAmount.data }, editedSide === 'receive')
  useFormSync(form, { outputAmount: outputAmount.data }, editedSide === 'pay')

  const {
    onSubmit,
    isPending: isSwapping,
    error: swapError,
  } = useSwapMutation({ ...poolParams, account, tokens: tokens.data ?? [], onReset: () => reset(userDefaultValues) })

  const { error, isLoading } = combineQueryState(tokenInputs, decimals, maxAmounts, reserves, ...Object.values(preview))
  const isPending = isSwapping || formState.isSubmitting
  return {
    form,
    tokens: tokenInputs,
    params,
    preview,
    isPending,
    isDisabled:
      isPending ||
      isDebouncing ||
      !formState.isValid ||
      !!error ||
      !outputAmount.data ||
      minimum.data == null ||
      !gas.data,
    isLoading: isPending || isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: swapError ?? error,
    formErrors: formState.visibleErrors,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
