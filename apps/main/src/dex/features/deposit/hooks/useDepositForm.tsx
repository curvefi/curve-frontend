import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useShallow } from 'zustand/react/shallow'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { hasWrapped, isWrappedOnly } from '@/dex/pool.utils'
import { useDepositBonus } from '@/dex/queries/deposit/deposit-bonus.query'
import { useSeedAmounts } from '@/dex/queries/deposit/deposit-seed-amounts.query'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimalMinus } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { useDepositMutation } from '../deposit.mutation'
import { depositFormValidationSuite } from '../deposit.validation'
import type { DepositFormState, DepositQuery } from '../types'
import { useDepositMaxAmounts } from './useDepositMaxAmounts'

const getDepositDefaults = (tokenCount: number, isWrapped: boolean, slippage: Decimal): DepositFormState => ({
  ...getPoolDefaultValues(tokenCount),
  isBalanced: false,
  isWrapped,
  decimals: undefined,
  slippage,
})

export const useDepositForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const { chainId, poolId, pool, isWrapped: contextIsWrapped, setIsWrapped, blockchainId } = usePoolContext()
  const { address: userAddress } = useConnection()
  const initialWrapped = isWrappedOnly(pool) || contextIsWrapped
  const initialTokenCount = (initialWrapped ? pool.wrappedCoins : pool.underlyingCoins).length
  const userDefaultValues = useMemo(
    () => getDepositDefaults(initialTokenCount, initialWrapped, maxSlippage),
    [initialTokenCount, initialWrapped, maxSlippage],
  )
  const form = useForm<DepositFormState>({ validation: depositFormValidationSuite, defaultValues: userDefaultValues })
  const { connect, connectState, wallet } = useWallet()

  // Dynamic field names prevent destructuring dependencies; keep the values stable between actual changes.
  const values = useShallow(identity<DepositFormState>)(form.watchValues())
  const isWrapped = form.watchValue('isWrapped')
  const canDepositWrapped = hasWrapped(pool)
  const wrappedOnly = isWrappedOnly(pool)
  const { tokens, tokenAddresses, tokenCount, decimals, balances } = usePoolTokens({
    chainId,
    blockchainId,
    pool,
    userAddress,
    isWrapped,
  })
  const reserves = usePoolCurrencyReserves({ chainId, poolId, isWrapped })
  const isSeed = mapQuery(reserves, reserves => Number(reserves.total) === 0)
  useFormSync(form, { decimals })

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])

  useEffect(
    () => form.update({ ...getPoolDefaultValues(tokenCount), isBalanced: false }),
    [form, isWrapped, tokenCount],
  )

  useEffect(() => {
    if (isSeed.data && canDepositWrapped) form.update({ isWrapped: true })
  }, [canDepositWrapped, form, isSeed.data])

  const [params, isDebouncing] = useFormDebounce<DepositQuery, keyof DepositFormState>(
    useMemo(() => ({ ...values, chainId, poolId, userAddress: userAddress! }), [chainId, poolId, userAddress, values]),
    userDefaultValues,
  )

  const bonus = useDepositBonus(params, isSeed.data === false)
  const priceImpact = mapQuery(bonus, bonus => decimalMinus('0', bonus))
  const maxAmounts = useDepositMaxAmounts({ params, tokenAddresses, balances })
  const firstAmount = params[poolAmountField(0)]
  const seedAmounts = useSeedAmounts(params, isSeed.data === true && Number(firstAmount) > 0)
  useEffect(() => {
    if (isSeed.data && seedAmounts.data)
      form.update(fromEntries(seedAmounts.data.map((amount, index) => [poolAmountField(index), amount])), {
        automated: true,
      })
  }, [form, isSeed.data, seedAmounts.data])

  const {
    onSubmit: submitMutation,
    isPending: isDepositing,
    error,
  } = useDepositMutation({
    chainId,
    poolId,
    userAddress,
    isWrapped,
    tokenCount,
    onReset: () => form.reset(userDefaultValues),
  })

  const { formState } = form
  const isPending = formState.isSubmitting || isDepositing
  const isDerivingSeedAmounts = isSeed.data === true && seedAmounts.isLoading
  return {
    form,
    params,
    reserves: mapQuery(reserves, reserves => reserves.tokens.map(token => token.balance)),
    isSeed,
    canDepositWrapped,
    isWrappedOnly: wrappedOnly,
    // Until reserves confirm this is not a seed pool, only the first amount is safe to enter.
    // A seed deposit must derive every remaining amount from the first one.
    enableFirstOnly: isSeed.data !== false,
    tokens,
    maxAmounts,
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
