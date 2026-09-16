import { identity } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { getBalancedWithdrawAmounts, getWithdrawLpBudget, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { withdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { completeArray, zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, poolAmountField, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueryState, useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { useWithdrawPreview, type WithdrawPreviewParams } from './useWithdrawPreview'

const formOptions = {
  validation: withdrawFormValidationSuite,
  defaultValues: {
    isBalanced: false,
    lpAmount: undefined,
    maxLpAmount: undefined,
    decimals: undefined,
    supply: undefined,
    seedLock: undefined,
    maximumBurn: undefined,
    quote: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

const getReserveAmounts = (reserves: Decimal[], decimals: (number | undefined)[]) =>
  zip(reserves, decimals).map(([amount, decimals]) => maybe(decimals, d => fromWei(amount, d)))

const getBalancedAmountsOnLpChange = (
  lpAmount: Decimal,
  decimals: number[],
  reserves: Decimal[],
  supply: Decimal,
  slippage: Decimal,
) =>
  fromEntries(
    getBalancedWithdrawAmounts(getWithdrawLpBudget(lpAmount, slippage), supply, reserves, decimals).map(
      (amount, index) => [poolAmountField(index), amount],
    ),
  )

export function useWithdrawForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const supply = usePoolSupply(poolParams)
  const reserves = usePoolReserves(poolParams)
  const tokens = mapQuery(config, config => config.tokens)
  const tokenCount = tokens.data?.length

  const { inputs: tokenInputs, decimals } = usePoolTokens({ ...poolParams, account, tokens })
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const slippage = useUserProfileStore(state => state.maxSlippage.stable)
  const maxAmounts = useCombinedQueries([reserves, decimals], getReserveAmounts)
  const userDefaultValues = useMemo(
    () => ({ ...maybe(tokenCount, getPoolDefaultValues), lpAmount: undefined }),
    [tokenCount],
  )
  const form = useForm<WithdrawFormValues>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, reset, update } = form

  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues]) // cannot useFormSync with a flexible number of fields
  useFormSync(form, {
    slippage,
    decimals: decimals.data,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
  })

  // Dynamic field names prevent destructuring dependencies; keep the values stable between actual changes.
  const values = useShallow(identity<WithdrawFormValues>)(form.watchValues())
  const [params, isDebouncing] = useFormDebounce<WithdrawPreviewParams, PoolAmountField | 'lpAmount'>(
    useMemo(
      () => ({
        ...values,
        network,
        pool,
        account,
        tokenCount,
        decimals: decimals.data,
        slippage,
        supply: supply.data,
        seedLock: config.data?.seedLock,
        maxLpAmount: lpBalance.data,
        maxAmounts: maxAmounts.data,
      }),
      [
        values,
        network,
        pool,
        account,
        tokenCount,
        decimals.data,
        slippage,
        supply.data,
        config.data?.seedLock,
        lpBalance.data,
        maxAmounts.data,
      ],
    ),
    userDefaultValues,
  )
  const preview = useWithdrawPreview(params)
  const { quote, expected, maximum, priceImpact, fee } = preview

  useFormSync(form, { quote: quote.data, maximumBurn: isDebouncing ? undefined : maximum.data })

  const {
    onSubmit,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWithdrawMutation({
    ...poolParams,
    account,
    tokens: tokens.data ?? [],
    onReset: () => reset(userDefaultValues),
  })

  // Only an explicit LP edit fills outputs. Quotes and token edits never rewrite the user's amounts.
  const onLpAmount = useCallback(
    (lpAmount: Decimal | undefined) => {
      update({
        lpAmount,
        ...(maybes(
          [lpAmount, completeArray(decimals.data), reserves.data, supply.data, slippage],
          getBalancedAmountsOnLpChange,
        ) ?? getPoolDefaultValues(tokenCount ?? 0)),
      })
    },
    [update, decimals.data, reserves.data, supply.data, slippage, tokenCount],
  )

  const isPending = formState.isSubmitting || isWithdrawing
  const { error, isLoading } = combineQueryState(
    tokenInputs,
    reserves,
    supply,
    decimals,
    maxAmounts,
    lpBalance,
    quote,
    expected,
    maximum,
    priceImpact,
    fee,
  )
  return {
    form,
    reserves: q(reserves),
    maxAmounts,
    params,
    preview,
    onLpAmount,
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || !!error || !fee.data,
    isLoading: isPending || isLoading,
    isLpDisabled: isPending || !maxAmounts.data || !supply.data || !+supply.data,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: withdrawError ?? error,
    formErrors: formState.visibleErrors,
    tokens: tokenInputs,
    priceImpact,
  }
}
