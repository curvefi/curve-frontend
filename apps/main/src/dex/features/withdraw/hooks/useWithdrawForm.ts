import { useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawLp } from '@/dex/queries/withdraw/withdraw-expected.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { getPoolAmounts, getPoolDefaultValues, LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { constQ, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useWithdrawMutation } from '../withdraw.mutation'
import { withdrawFormValidationSuite } from '../withdraw.validation'
import { useWithdrawMaxAmounts } from './useWithdrawMaxAmounts'

const getWithdrawDefaultValues = (tokenCount: number) => ({
  ...getPoolDefaultValues(tokenCount),
  lpAmount: undefined,
  maxWithdrawIndex: undefined,
  isBalanced: false,
})

const getWithdrawDefaults = (tokenCount: number, isWrapped: boolean, slippage: Decimal) => ({
  ...getWithdrawDefaultValues(tokenCount),
  isWrapped,
  slippage,
})

export const useWithdrawForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const {
    chainId,
    poolAddress,
    pool: { data: pool, isLoading: isPoolLoading },
    isWrapped: initialWrapped,
    setIsWrapped,
    blockchainId,
  } = usePoolContext()
  const { address: userAddress } = useConnection()
  const initialTokenCount = (initialWrapped ? pool?.wrappedCoins : pool?.underlyingCoins)?.length ?? 0
  const userDefaultValues = useMemo(
    () => getWithdrawDefaults(initialTokenCount, initialWrapped, maxSlippage),
    [initialTokenCount, initialWrapped, maxSlippage],
  )
  const form = useForm<WithdrawFormValues>({
    validation: withdrawFormValidationSuite,
    defaultValues: {
      ...userDefaultValues,
      decimals: undefined,
      maxLpAmount: undefined,
      maximumBurn: undefined,
      supply: undefined,
      seedLock: undefined,
    },
  })
  const { formState, handleSubmit, update, reset, values } = form
  const { connect, connectState, wallet } = useWallet()
  const isWrapped = values.isWrapped! // isWrapped is optional but always passed in this app.
  const { tokens, tokenCount, decimals } = usePoolTokens({ chainId, blockchainId, pool, userAddress, isWrapped })
  const { lpTokenBalance: lpBalance } = usePoolTokenDepositBalances({ chainId, poolAddress, userAddress })
  const canWithdrawOneCoin = !isWrapped || !pool?.isLending || !pool.zap
  const maxAmounts = useWithdrawMaxAmounts({
    params: { chainId, poolAddress, isWrapped, lpAmount: lpBalance.data },
    tokenCount,
    enabled: canWithdrawOneCoin,
  })

  const [params, isDebouncing] = useFormDebounce(
    { ...values, isWrapped, chainId, poolAddress, decimals, userAddress, maxLpAmount: lpBalance.data },
    userDefaultValues,
  )
  const queryParams = { ...params, amounts: getPoolAmounts(params, tokenCount) }
  const { expectedLp, maximumLp } = useWithdrawLp(queryParams)
  const priceImpact = useWithdrawPriceImpact(queryParams)
  const reserves = mapQuery(
    usePoolCurrencyReserves({ chainId, poolAddress, isWrapped }),
    // Reserve scaling is approximate: lending/metapool conversions round in a different order in the SDK.
    data => data.tokens.map(token => token.balance),
  )
  const supply = mapQuery(usePoolParameters({ chainId, poolAddress }), data => data.lpTokenSupply as Decimal)

  useFormSync(form, { decimals, maxLpAmount: lpBalance.data, maximumBurn: maximumLp.data, supply: supply.data })
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))
  useFormSync(form, { lpAmount: lpBalance.data }, values.maxWithdrawIndex != null)
  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])
  useEffect(
    () => update(getWithdrawDefaultValues(tokenCount)),
    [update, isWrapped, tokenCount, chainId, poolAddress, userAddress],
  )

  const {
    onSubmit: submitMutation,
    isPending: isWithdrawing,
    error,
  } = useWithdrawMutation({ chainId, poolAddress, tokenCount, onReset: () => reset(userDefaultValues) })
  const isPending = formState.isSubmitting || isWithdrawing
  const selectedMax = maybe(values.maxWithdrawIndex, index => maxAmounts[index])
  const isDerivingAmounts = !!selectedMax?.isLoading

  return {
    form,
    params: queryParams,
    tokens,
    // Token Max means full-LP one-coin withdrawal, which the SDK does not support for lending-with-zap wrapped tokens.
    maxAmounts: canWithdrawOneCoin ? maxAmounts : undefined,
    reserves,
    supply,
    decimals: decimals?.map(constQ),
    lpTokenDecimals: LP_TOKEN_DECIMALS,
    lpBalance,
    expectedLp,
    maximumLp,
    canWithdrawWrapped: !!hasWrapped(pool),
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSubmit: handleSubmit(submitMutation),
    isPending,
    isLoading: isPoolLoading || isPending || isDerivingAmounts || priceImpact.isLoading || expectedLp.isLoading,
    isDisabled:
      pool == null ||
      !formState.isValid ||
      isPending ||
      isDebouncing ||
      !!expectedLp.error || // Failed refetches can retain stale quotes.
      (values.maxWithdrawIndex != null && (selectedMax?.data == null || !!selectedMax.error)) ||
      shouldBlockTransaction(priceImpact),
    error,
    formErrors: formState.visibleErrors,
  }
}
