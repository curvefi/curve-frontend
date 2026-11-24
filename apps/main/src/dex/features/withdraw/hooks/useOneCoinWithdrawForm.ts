import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawMaxAmount } from '@/dex/queries/withdraw/withdraw-max-amounts.query'
import { useWithdrawOneCoinQuote } from '@/dex/queries/withdraw/withdraw-one-coin-quote.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { useFormSync } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { useWithdrawQuoteQueries } from '@ui/features/pool-forms/withdraw/useWithdrawQuoteQueries'
import { oneCoinWithdrawDefaultValues as userDefaultValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { decimalEqual } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useWithdrawMutation } from '../withdraw.mutation'
import { oneCoinWithdrawFormValidationSuite } from '../withdraw.validation'

export const useOneCoinWithdrawForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const {
    chainId,
    poolAddress,
    pool: poolQuery,
    isWrapped: initialWrapped,
    setIsWrapped,
    blockchainId,
  } = usePoolContext()
  const { address: userAddress } = useConnection()
  const { connect, connectState, wallet } = useWallet()
  const { data: pool, isLoading: isPoolLoading } = poolQuery

  const inputs = useFormValues({
    defaultValues: { ...userDefaultValues, isWrapped: initialWrapped, tokenIndex: 0, slippage: maxSlippage },
    context: { chainId, poolAddress, userAddress },
  })
  const { update, reset, values, isDebouncing } = inputs

  const isWrapped = values.isWrapped // isWrapped is optional but always passed in this app.
  const index = values.tokenIndex
  const poolParams = { chainId, poolAddress, isWrapped, userAddress }
  const { tokens, decimals } = usePoolTokens({ chainId, blockchainId, pool, userAddress, isWrapped })
  const { lpTokenBalance: lpBalance } = usePoolTokenDepositBalances(poolParams)
  const reserves = mapQuery(usePoolCurrencyReserves(poolParams), data => data.tokens.map(token => token.balance))
  const supply = mapQuery(usePoolParameters(poolParams), data => data.lpTokenSupply as Decimal)

  // curve-js has no wrapped one-coin quote or withdrawal for lending pools with a zap.
  const canWithdrawWrapped = !!hasWrapped(pool) && !(pool?.isLending && pool.zap)
  const { max, expectedLp, quotedAmount, minimumReceived, params, priceImpact } = useWithdrawQuoteQueries({
    poolParams,
    values: { ...values, supply: supply.data },
    debounced: inputs.params,
    isDebouncing,
    decimals,
    lpBalance,
    enabled: !isWrapped || canWithdrawWrapped,
    useWithdrawMaxAmount,
    useWithdrawOneCoinQuote,
    useWithdrawPriceImpact,
  })

  const { onSubmit, isPending, error } = useWithdrawMutation({
    chainId,
    poolAddress,
    onReset: () => reset(userDefaultValues),
  })

  const form = useFormValidation({
    inputs,
    validation: oneCoinWithdrawFormValidationSuite,
    computed: {
      decimals: mapQuery(poolQuery, () => decimals),
      supply,
      maxLpAmount: lpBalance,
      poolReserve: mapQuery(reserves, reserves => reserves[index]),
      expectedLp,
      quotedAmount,
    },
    isSubmitting: isPending,
    disabled: pool == null || shouldBlockTransaction(priceImpact),
  })

  // Keep Max selected as the quote changes, including while its amount is unavailable.
  useFormSync(form, { amount: max.data }, values.isMax)

  // Apply the resolved pool's default without replacing a user's slippage choice.
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))
  useFormSync(form, { isWrapped: false }, pool != null && !canWithdrawWrapped)

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])

  useEffect(() => reset({ ...userDefaultValues, tokenIndex: 0 }), [reset, isWrapped, chainId, poolAddress, userAddress])

  const onMax = () => update({ amount: max.data, isMax: true })

  return {
    form,
    params,
    minimumReceived,
    tokens,
    index,
    max,
    lpBalance,
    expectedLp,
    priceImpact,
    toSymbol: tokens?.[index]?.data?.symbol,
    inputDisabled: isPending || !tokens?.[index]?.data || !supply.data || !+supply.data,
    wrapped: canWithdrawWrapped
      ? { checked: isWrapped, onChange: (isWrapped: boolean) => update({ isWrapped }, { mode: 'immediate' }) }
      : undefined,
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSlippageChange: (slippage: Decimal) => update({ slippage }, { mode: 'immediate' }),
    onCoinChange: (tokenIndex: number) => update({ ...userDefaultValues, tokenIndex }, { mode: 'immediate' }),
    onMax,
    onAmountChange: (amount: Decimal | undefined) =>
      maybes([amount, max.data], decimalEqual) ? onMax() : update({ amount, isMax: false }),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isLoading: isPoolLoading || form.isLoading || priceImpact.isLoading,
    isDisabled: form.isDisabled,
    error: error ?? form.error,
    formErrors: form.formState.visibleErrors,
  }
}
