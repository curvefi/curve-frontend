import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
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
import { fromEntries, range } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { getPoolDefaultValues, poolAmountField, poolMaxAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { createBalancedWithdraw } from '@ui/features/pool-forms/withdraw/createBalancedWithdraw'
import {
  getAdvancedWithdrawParams,
  type AdvancedWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawQuoteParams } from '../types'
import { useWithdrawMutation } from '../withdraw.mutation'
import { advancedWithdrawFormValidationSuite } from '../withdraw.validation'

export const useAdvancedWithdrawForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const {
    chainId,
    poolAddress,
    pool: { data: pool, isLoading: isPoolLoading },
    isWrapped: initialWrapped,
    setIsWrapped,
    blockchainId,
  } = usePoolContext()
  const { address: userAddress } = useConnection()
  const { connect, connectState, wallet } = useWallet()

  const initialTokenCount = (initialWrapped ? pool?.wrappedCoins : pool?.underlyingCoins)?.length ?? 0
  const userDefaultValues = useShallow((tokenCount: number) => ({
    ...getPoolDefaultValues(tokenCount),
    lpAmount: undefined,
    isBalanced: true,
  }))(initialTokenCount)
  const form = useForm<AdvancedWithdrawFormValues>({
    validation: advancedWithdrawFormValidationSuite,
    defaultValues: {
      ...userDefaultValues,
      isWrapped: initialWrapped,
      slippage: maxSlippage,
      decimals: undefined,
      maxLpAmount: undefined,
      maximumBurn: undefined,
      supply: undefined,
      seedLock: undefined,
    },
  })
  const { formState, handleSubmit, update, reset, values } = form

  const isWrapped = values.isWrapped! // isWrapped is optional but always passed in this app.
  const poolParams = { chainId, poolAddress, isWrapped, userAddress }
  const { tokens, tokenCount, decimals } = usePoolTokens({ chainId, blockchainId, pool, userAddress, isWrapped })
  const { lpTokenBalance: lpBalance } = usePoolTokenDepositBalances(poolParams)
  const reserves = mapQuery(usePoolCurrencyReserves(poolParams), data => data.tokens.map(token => token.balance))
  const supply = mapQuery(usePoolParameters(poolParams), data => data.lpTokenSupply as Decimal)

  const [debounced, isDebouncing] = useFormDebounce(values, userDefaultValues)
  const params: WithdrawQuoteParams = { ...getAdvancedWithdrawParams(debounced), ...poolParams }
  const { expectedLp, maximumLp } = useWithdrawLp(params)
  const priceImpact = useWithdrawPriceImpact(params)

  useFormSync(form, {
    decimals,
    maxLpAmount: lpBalance.data,
    maximumBurn: maximumLp.data,
    supply: supply.data,
    ...fromEntries(range(tokenCount).map(index => [poolMaxAmountField(index), reserves.data?.[index]])),
  })

  // Apply the resolved pool's default without replacing a user's slippage choice.
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])

  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues, isWrapped, chainId, poolAddress, userAddress])

  const {
    onSubmit,
    isPending: isWithdrawing,
    error,
  } = useWithdrawMutation({ chainId, poolAddress, onReset: () => reset(userDefaultValues) })

  const { canBalance, lpAmountUsd, getUpdatesFromLpAmount, getUpdatesFromTokenAmount } = createBalancedWithdraw({
    values,
    tokens,
    tokenCount,
    reserves,
    supply,
  })

  const isPending = formState.isSubmitting || isWithdrawing

  // TODO: Surface reserves and supply loading/errors in the form, including the LP USD value.
  return {
    form,
    params,
    tokens,
    lpBalance,
    expectedLp,
    maximumLp,
    priceImpact,
    canBalance,
    lpAmountUsd: lpAmountUsd.data,
    canWithdrawWrapped: !!hasWrapped(pool),
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onLpChange: (lpAmount: Decimal | undefined) => update(getUpdatesFromLpAmount(lpAmount)),
    onBalancedChange: (isBalanced: boolean) =>
      update({ ...(isBalanced && getUpdatesFromLpAmount(values.lpAmount)), isBalanced }),
    onTokenChange: (index: number, amount: Decimal | undefined) =>
      update({ ...(values.isBalanced && getUpdatesFromTokenAmount(index, amount)), [poolAmountField(index)]: amount }),
    onSlippageChange: (slippage: Decimal) => update({ slippage }),
    onSubmit: handleSubmit(onSubmit),
    isPending,
    isLoading: isPoolLoading || isPending || priceImpact.isLoading || expectedLp.isLoading,
    isDisabled: pool == null || !formState.isValid || isPending || isDebouncing || shouldBlockTransaction(priceImpact),
    error,
    formErrors: formState.visibleErrors,
  }
}
