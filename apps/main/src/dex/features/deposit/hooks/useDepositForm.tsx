import { useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { hasWrapped, isWrappedOnly } from '@/dex/pool.utils'
import { useDepositPriceImpact } from '@/dex/queries/deposit/deposit-bonus.query'
import { useSeedAmounts } from '@/dex/queries/deposit/deposit-seed-amounts.query'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { useForm, type UseFormReturn, useFormSync } from '@ui/features/forms'
import { getPoolAmounts, getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { toWei } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useDepositMutation } from '../deposit.mutation'
import { depositFormValidationSuite } from '../deposit.validation'
import type { DepositFormValues, UserDepositParams } from '../types'
import { useDepositMaxAmounts } from './useDepositMaxAmounts'

const getDepositDefaults = (tokenCount: number, isWrapped: boolean, slippage: Decimal) => ({
  ...getPoolDefaultValues(tokenCount),
  isWrapped,
  slippage,
})

/** When seeding the pool, applies the returned amounts to the form based on the 1st value. */
function useForceSeedAmounts(
  params: UserDepositParams,
  { data: isSeed }: QueryProp<boolean>,
  { update }: UseFormReturn<DepositFormValues>,
) {
  const { data: amounts, isLoading } = useSeedAmounts(params, isSeed === true && !!Number(params.amounts?.[0]))
  useEffect(() => {
    if (isSeed && amounts)
      update(fromEntries(amounts.map((amount, index) => [poolAmountField(index), amount])), { automated: true })
  }, [update, isSeed, amounts])
  return { isLoading }
}

export const useDepositForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const { chainId, poolId, pool, isWrapped: initialWrapped, setIsWrapped, blockchainId, api } = usePoolContext()
  const { address: userAddress } = useConnection()
  const nativeToken = api?.getNetworkConstants().NATIVE_TOKEN
  const initialTokenCount = (initialWrapped ? pool.wrappedCoins : pool.underlyingCoins).length
  const userDefaultValues = useMemo(
    () => getDepositDefaults(initialTokenCount, initialWrapped, maxSlippage),
    [initialTokenCount, initialWrapped, maxSlippage],
  )
  const form = useForm<DepositFormValues>({
    validation: depositFormValidationSuite,
    defaultValues: { ...userDefaultValues, decimals: undefined, isBalanced: false },
  })
  const { formState, handleSubmit, update, watchValues, reset } = form
  const { connect, connectState, wallet } = useWallet()

  const values = watchValues()
  const { isWrapped } = values
  const canDepositWrapped = hasWrapped(pool)

  const { tokens, tokenAddresses, tokenCount, decimals, balances } = usePoolTokens({
    chainId,
    blockchainId,
    pool,
    userAddress,
    isWrapped,
  })
  const reserves = usePoolCurrencyReserves({ chainId, poolId, isWrapped })
  const isSeed = mapQuery(reserves, reserves => !Number(reserves.total))
  useFormSync(form, { decimals })

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])

  useEffect(() => update({ ...getPoolDefaultValues(tokenCount), isBalanced: false }), [isWrapped, tokenCount, update])

  useEffect(() => {
    if (isSeed.data && canDepositWrapped) update({ isWrapped: true })
  }, [canDepositWrapped, update, isSeed.data])

  const [params, isDebouncing] = useFormDebounce(
    { ...values, chainId, poolId, decimals, userAddress },
    userDefaultValues,
  )

  const queryParams = { ...params, amounts: getPoolAmounts(params, tokenCount) }
  const priceImpact = useDepositPriceImpact(queryParams, isSeed.data === false)
  const seedAmounts = useForceSeedAmounts(queryParams, isSeed, form)

  const {
    onSubmit: submitMutation,
    isPending: isDepositing,
    error,
  } = useDepositMutation({ chainId, poolId, tokenCount, onReset: () => reset(userDefaultValues) })

  const isPending = formState.isSubmitting || isDepositing
  const isDerivingSeedAmounts = isSeed.data === true && seedAmounts.isLoading

  return {
    form,
    params: queryParams,
    reserves: mapQuery(reserves, reserves =>
      // todo: make sure reserves use formatted values across the app, keep raw values to queries and mutations
      reserves.tokens.map((token, index) => toWei(token.balance, decimals[index])),
    ),
    isSeed,
    canDepositWrapped,
    isWrappedOnly: isWrappedOnly(pool),
    // Unfortunately, curve.js requires a wallet. Seed deposit derives amounts from the first.
    inputsDisabled: !wallet || isPending || (isSeed.data !== false && ('first-only' as const)),
    tokens,
    maxAmounts: useDepositMaxAmounts({ params: queryParams, tokenAddresses, balances, nativeToken }),
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSubmit: handleSubmit(submitMutation),
    isPending,
    isLoading: isPending || priceImpact.isLoading || isDerivingSeedAmounts,
    isDisabled:
      !formState.isValid ||
      isPending ||
      isDebouncing ||
      isDerivingSeedAmounts ||
      shouldBlockTransaction(priceImpact, isSeed.data === false),
    error,
    formErrors: formState.visibleErrors,
  }
}
