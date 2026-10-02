import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
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
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useDepositMutation } from '../deposit.mutation'
import { depositFormValidationSuite } from '../deposit.validation'
import type { DepositFormValues, UserDepositParams } from '../types'
import { useDepositMaxAmounts } from './useDepositMaxAmounts'

const getDepositDefaults = (tokenCount: number, isWrapped: boolean, slippage: Decimal): DepositFormValues => ({
  ...getPoolDefaultValues(tokenCount),
  isBalanced: false,
  isWrapped,
  decimals: undefined,
  slippage,
})

/** When seeding the pool, applies the returned amounts to the form based on the 1st value. */
function useForceSeedAmounts(
  params: UserDepositParams,
  { data: isSeed }: QueryProp<boolean>,
  form: UseFormReturn<DepositFormValues>,
) {
  const { data: amounts, isLoading } = useSeedAmounts(params, isSeed === true && !!Number(params[poolAmountField(0)]))
  useEffect(() => {
    if (isSeed && amounts)
      form.update(fromEntries(amounts.map((amount, index) => [poolAmountField(index), amount])), { automated: true })
  }, [form, isSeed, amounts])
  return { isLoading }
}

export const useDepositForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const { chainId, poolId, pool, isWrapped: contextIsWrapped, setIsWrapped, blockchainId } = usePoolContext()
  const { address: userAddress } = useConnection()
  const initialWrapped = isWrappedOnly(pool) || contextIsWrapped
  const initialTokenCount = (initialWrapped ? pool.wrappedCoins : pool.underlyingCoins).length
  const userDefaultValues = useMemo(
    () => getDepositDefaults(initialTokenCount, initialWrapped, maxSlippage),
    [initialTokenCount, initialWrapped, maxSlippage],
  )
  const form = useForm<DepositFormValues>({ validation: depositFormValidationSuite, defaultValues: userDefaultValues })
  const { connect, connectState, wallet } = useWallet()

  const values = useShallow(identity<DepositFormValues>)(form.watchValues()) // Dynamic field names prevent destructuring dependencies; useShallow keeps the values stable between actual changes.
  const isWrapped = form.watchValue('isWrapped')
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

  useEffect(
    () => form.update({ ...getPoolDefaultValues(tokenCount), isBalanced: false }),
    [form, isWrapped, tokenCount],
  )

  useEffect(() => {
    if (isSeed.data && canDepositWrapped) form.update({ isWrapped: true })
  }, [canDepositWrapped, form, isSeed.data])

  const [params, isDebouncing] = useFormDebounce<UserDepositParams, keyof DepositFormValues>(
    useMemo(() => ({ ...values, chainId, poolId }), [chainId, poolId, values]),
    userDefaultValues,
  )

  const priceImpact = useDepositPriceImpact(params, isSeed.data === false)
  const seedAmounts = useForceSeedAmounts(params, isSeed, form)

  const {
    onSubmit: submitMutation,
    isPending: isDepositing,
    error,
  } = useDepositMutation({ chainId, poolId, tokenCount, onReset: () => form.reset(userDefaultValues) })

  const { formState } = form
  const isPending = formState.isSubmitting || isDepositing
  const isDerivingSeedAmounts = isSeed.data === true && seedAmounts.isLoading
  return {
    form,
    params,
    reserves: mapQuery(reserves, reserves => reserves.tokens.map(token => token.balance)),
    isSeed,
    canDepositWrapped,
    isWrappedOnly: isWrappedOnly(pool),
    // Until reserves confirm this is not a seed pool, only the first amount is safe to enter.
    // A seed deposit must derive every remaining amount from the first one.
    enableFirstOnly: isSeed.data !== false,
    tokens,
    maxAmounts: useDepositMaxAmounts({ params, tokenAddresses, balances }),
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSubmit: form.handleSubmit(submitMutation),
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
