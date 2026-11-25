import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useSwapPriceImpact } from '@/stellar/features/swap/useSwapPriceImpact'
import { STELLAR_DEFAULT_SLIPPAGE } from '@/stellar/lib/pool.constants'
import { useSwapMutation } from '@/stellar/mutations/swap.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { swapFormValidationSuite } from '@/stellar/queries/validation/swap.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { useSwapFormActions } from '@ui/features/pool-forms/swap/useSwapFormActions'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { SwapFormQuery } from './types'
import { useSwapLowExchangeRate } from './useSwapLowExchangeRate'

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
    slippage: STELLAR_DEFAULT_SLIPPAGE,
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
    { ...values, network, pool, account },
    userDefaultValues,
  )

  const { inputAmount, expectedOutput, exchangeRate } = useQuoteQueries(params)
  const lowExchangeRate = useSwapLowExchangeRate(params, exchangeRate)
  const priceImpact = useSwapPriceImpact({ ...params, inputAmount: inputAmount.data }, expectedOutput)
  useFormSync(form, { decimals: decimalsData, maxAmount, maxOutput, expectedOutput: expectedOutput.data })

  useFormSync(form, { inputAmount: inputAmount.data }, editedSide === 'receive')
  useFormSync(form, { outputAmount: expectedOutput.data }, editedSide === 'pay')

  const {
    onSubmit: submit,
    isPending: isSwapping,
    error: swapError,
  } = useSwapMutation({
    ...poolParams,
    account,
    tokens: tokenAddresses.data ?? [],
    onReset: () => reset(userDefaultValues),
  })
  const { onSubmit, lowRateModal } = useSwapFormActions({
    handleSubmit: form.handleSubmit,
    lowExchangeRate,
    onConfirmed: submit,
  })
  const isPending = isSwapping || formState.isSubmitting
  const fromSymbol = tokens?.[fromIndex]?.data?.symbol
  const toSymbol = tokens?.[toIndex]?.data?.symbol
  return {
    form,
    tokens,
    fromSymbol,
    toSymbol,
    params,
    inputAmount,
    expectedOutput,
    max,
    canSwapWrapped: false,
    lowExchangeRate,
    lowRateModal: {
      ...lowRateModal,
      exchangeRate: exchangeRate.data,
      expectedOutput: expectedOutput.data,
      fromSymbol,
      toSymbol,
    },
    isPending,
    isDisabled:
      isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact) || !!lowExchangeRate.error,
    isLoading:
      isPending ||
      config.isLoading ||
      inputAmount.isLoading ||
      expectedOutput.isLoading ||
      priceImpact.isLoading ||
      lowExchangeRate.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: swapError ?? lowExchangeRate.error,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    onSubmit,
  }
}
