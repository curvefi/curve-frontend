import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { useSwapPriceImpact } from '@/dex/queries/swap/swap-price-impact.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import type { SwapFormValues } from '@ui/features/pool-forms/swap/swap-form.utils'
import { useSwapFormActions } from '@ui/features/pool-forms/swap/useSwapFormActions'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useSwapMutation } from '../swap.mutation'
import { swapFormValidationSuite } from '../swap.validation'
import { useQuoteQueries } from './useQuoteQueries'
import { useSwapLowExchangeRate } from './useSwapLowExchangeRate'
import { useSwapMaxAmount } from './useSwapMaxAmount'

const userDefaultValues = { inputAmount: undefined, outputAmount: undefined, editedSide: 'pay' } as const

export const useSwapForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const {
    chainId,
    blockchainId,
    poolAddress,
    pool: { data: pool, isLoading: isPoolLoading },
    isWrapped: initialWrapped,
    setIsWrapped,
  } = usePoolContext()
  const { address: userAddress } = useConnection()
  const { connect, connectState, wallet } = useWallet()
  const form = useForm<SwapFormValues>({
    validation: swapFormValidationSuite,
    defaultValues: {
      ...userDefaultValues,
      fromIndex: 0,
      toIndex: 1,
      isWrapped: initialWrapped,
      slippage: maxSlippage,
      decimals: undefined,
      maxAmount: undefined,
      maxOutput: undefined,
      expectedOutput: undefined,
    },
  })
  const { formState, values, reset } = form
  const { isWrapped, fromIndex, toIndex, editedSide } = values
  const poolParams = { chainId, poolAddress, isWrapped, userAddress }
  const { tokens, tokenAddresses, decimals, balances } = usePoolTokens({
    chainId,
    blockchainId,
    pool,
    userAddress,
    isWrapped,
  })
  const maxOutput = mapQuery(
    usePoolCurrencyReserves(poolParams, editedSide === 'receive'),
    reserves => reserves.tokens[toIndex]?.balance,
  )
  const [params, isDebouncing] = useFormDebounce({ ...values, ...poolParams }, userDefaultValues)
  const { inputAmount, expectedOutput, exchangeRate } = useQuoteQueries(params, maxOutput)
  const lowExchangeRate = useSwapLowExchangeRate({ ...values, tokenAddresses, exchangeRate })
  const queryParams = { ...params, inputAmount: inputAmount.data }
  const priceImpact = useSwapPriceImpact(queryParams)
  const max = useSwapMaxAmount({
    params: queryParams,
    tokenAddress: tokenAddresses[fromIndex],
    balance: balances[tokenAddresses[fromIndex]] ?? DISABLED_Q,
  })

  useFormSync(form, { decimals, maxAmount: max.data, maxOutput: maxOutput.data, expectedOutput: expectedOutput.data })
  useFormSync(form, { inputAmount: inputAmount.data }, editedSide === 'receive')
  useFormSync(form, { outputAmount: expectedOutput.data }, editedSide === 'pay')
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])
  useEffect(
    () => reset({ ...userDefaultValues, fromIndex: 0, toIndex: 1, expectedOutput: undefined }),
    [reset, isWrapped, chainId, poolAddress, userAddress],
  )

  const {
    onSubmit: submit,
    isPending: isSwapping,
    error,
  } = useSwapMutation({ chainId, poolAddress, onReset: () => reset(userDefaultValues) })
  const { onSubmit, lowRateModal } = useSwapFormActions({
    handleSubmit: form.handleSubmit,
    lowExchangeRate,
    onConfirmed: submit,
  })
  const isPending = isSwapping || formState.isSubmitting
  const [fromSymbol, toSymbol] = [fromIndex, toIndex].map(i => tokens?.[i]?.data?.symbol)
  return {
    form,
    params: queryParams,
    tokens,
    inputAmount,
    expectedOutput: combineQueries([expectedOutput, lowExchangeRate], output => output),
    exchangeRate,
    max,
    canSwapWrapped: !!hasWrapped(pool),
    fromSymbol,
    toSymbol,
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSubmit,
    lowExchangeRate,
    lowRateModal: {
      ...lowRateModal,
      exchangeRate: exchangeRate.data,
      expectedOutput: expectedOutput.data,
      fromSymbol,
      toSymbol,
    },
    isPending,
    isLoading:
      isPoolLoading ||
      isPending ||
      inputAmount.isLoading ||
      expectedOutput.isLoading ||
      priceImpact.isLoading ||
      lowExchangeRate.isLoading,
    isDisabled:
      isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact) || !!lowExchangeRate.error,
    error,
    formErrors: formState.visibleErrors,
  }
}
