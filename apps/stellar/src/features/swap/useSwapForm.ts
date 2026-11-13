import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useSwapPriceImpact } from '@/stellar/features/swap/useSwapPriceImpact'
import { useSwapMutation } from '@/stellar/mutations/swap.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { swapFormValidationSuite } from '@/stellar/queries/validation/swap.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { SwapFormQuery } from './types'

const userDefaultValues = { inputAmount: undefined, outputAmount: undefined, editedSide: 'pay' } as const
const formOptions = {
  validation: swapFormValidationSuite,
  defaultValues: {
    ...userDefaultValues,
    isWrapped: false,
    fromIndex: 0,
    toIndex: 1,
    decimals: undefined,
    maxAmount: undefined,
    maxOutput: undefined,
    expectedOutput: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

export function useSwapForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, decimalsData, maxAmounts } = usePoolTokens({ ...poolParams, account, tokenAddresses }) ?? {}
  const reserves = usePoolReserves({ ...poolParams, decimals: decimalsData })
  const form = useForm<SwapFormValues>(formOptions)
  const { formState, reset, values } = form
  const { fromIndex, toIndex, editedSide } = values
  const max = maxAmounts?.[fromIndex] ?? DISABLED_Q
  const maxAmount = max.data
  const maxOutput = reserves.data?.[toIndex]

  const [params, isDebouncing] = useFormDebounce<SwapFormQuery, 'inputAmount' | 'outputAmount' | 'editedSide'>(
    {
      network,
      pool,
      account,
      isWrapped: values.isWrapped,
      inputAmount: values.inputAmount,
      outputAmount: values.outputAmount,
      fromIndex,
      toIndex,
      editedSide,
      decimals: decimalsData,
      maxAmount,
      maxOutput,
      slippage: values.slippage,
    },
    userDefaultValues,
  )

  const { inputAmount, expectedOutput } = useQuoteQueries(params)
  const priceImpact = useSwapPriceImpact({ ...params, inputAmount: inputAmount.data }, expectedOutput)
  useFormSync(form, { decimals: decimalsData, maxAmount, maxOutput, expectedOutput: expectedOutput.data })

  useFormSync(form, { inputAmount: inputAmount.data }, editedSide === 'receive')
  useFormSync(form, { outputAmount: expectedOutput.data }, editedSide === 'pay')

  const {
    onSubmit,
    isPending: isSwapping,
    error: swapError,
  } = useSwapMutation({
    ...poolParams,
    account,
    tokens: tokenAddresses.data ?? [],
    onReset: () => reset(userDefaultValues),
  })

  const isPending = isSwapping || formState.isSubmitting
  return {
    form,
    tokens,
    fromSymbol: tokens?.[fromIndex]?.data?.symbol,
    toSymbol: tokens?.[toIndex]?.data?.symbol,
    params,
    inputAmount,
    expectedOutput,
    max,
    canSwapWrapped: false,
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact),
    isLoading: isPending || config.isLoading || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: swapError,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    onSubmit: form.handleSubmit(onSubmit),
  }
}
