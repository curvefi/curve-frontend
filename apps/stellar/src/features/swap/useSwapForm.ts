import { useMemo } from 'react'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useSwapMutation } from '@/stellar/mutations/swap.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { swapFormValidationSuite } from '@/stellar/queries/validation/swap.validation'
import { maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import type { SwapFormQuery } from './types'

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

  const [params, isDebouncing] = useFormDebounce<SwapFormQuery, 'inputAmount' | 'outputAmount' | 'editedSide'>(
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

  const { inputAmount, outputAmount } = useQuoteQueries(params)
  const minimum = mapQuery(outputAmount, value =>
    maybe(params.decimals?.[toIndex], precision => calculateMinimumReceived(value, params.slippage, precision)),
  )
  useFormSync(form, { decimals: decimals.data, maxAmount, maxOutput, slippage, minimum: minimum.data })

  // Don't overwrite form while a changed pair or amount is being debounced
  useFormSync(form, { inputAmount: inputAmount.data }, !isDebouncing && editedSide === 'receive')
  useFormSync(form, { outputAmount: outputAmount.data }, !isDebouncing && editedSide === 'pay')

  const {
    onSubmit,
    isPending: isSwapping,
    error: swapError,
  } = useSwapMutation({ ...poolParams, account, tokens: tokens.data ?? [], onReset: () => reset(userDefaultValues) })

  const isPending = isSwapping || formState.isSubmitting
  return {
    form,
    tokens: tokenInputs,
    fromSymbol: tokenInputs.data?.[fromIndex]?.symbol,
    toSymbol: tokenInputs.data?.[toIndex]?.symbol,
    slippage,
    params,
    inputAmount,
    outputAmount,
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid,
    isLoading: isPending,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: swapError,
    formErrors: formState.visibleErrors,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
