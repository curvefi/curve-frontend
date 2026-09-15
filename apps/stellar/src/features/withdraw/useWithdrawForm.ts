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
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { combineQueryState, useCombinedQueries } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { useWithdrawPreview, type WithdrawPreviewParams } from './useWithdrawPreview'

const defaultValues = {
  isBalanced: false,
  lpAmount: undefined,
  maxLpAmount: undefined,
  decimals: undefined,
  supply: undefined,
  seedLock: undefined,
  maximumBurn: undefined,
  quote: undefined,
  slippage: SLIPPAGE.stable.default,
}

const getReserveAmounts = (reserves: Decimal[], decimals: number[]) =>
  zip(reserves, decimals).map(([amount, decimals]) => fromWei(amount, decimals))

export const useWithdrawForm = (poolParams: PoolQuery) => {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const reserves = usePoolReserves(poolParams)
  const supply = usePoolSupply(poolParams)
  const addresses = mapQuery(config, config => config.tokens)
  const tokenCount = addresses.data?.length
  const { inputs: tokens, decimals } = usePoolTokens({ ...poolParams, account, tokens: addresses })
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const slippage = useUserProfileStore(state => state.maxSlippage.stable)
  const maxAmounts = useCombinedQueries([reserves, decimals], getReserveAmounts)
  const userDefaultValues = useMemo(
    () => ({ ...maybe(tokenCount, getPoolDefaultValues), lpAmount: undefined }),
    [tokenCount],
  )
  const form = useForm<WithdrawFormValues>({
    validation: withdrawFormValidationSuite,
    defaultValues: { ...defaultValues, ...userDefaultValues },
  })
  const { formState, reset, update } = form
  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues])
  useFormSync(form, {
    slippage,
    decimals: decimals.data,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
  })

  const values = useShallow(identity<WithdrawFormValues>)(form.watchValues())
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      (): WithdrawPreviewParams => ({
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
  useFormSync(form, { quote: preview.quote.data, maximumBurn: isDebouncing ? undefined : preview.maximum.data })
  const {
    onSubmit,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWithdrawMutation({
    ...poolParams,
    account,
    tokens: addresses.data ?? [],
    onReset: () => reset(userDefaultValues),
  })

  // Only an explicit LP edit fills outputs. Quotes and token edits never rewrite the user's amounts.
  const onLpAmount = useCallback(
    (lpAmount: Decimal | undefined) => {
      update({
        lpAmount,
        ...(maybes([lpAmount, decimals.data, reserves.data, supply.data], (lpAmount, decimals, reserves, supply) => {
          const budget = getWithdrawLpBudget(lpAmount, slippage)
          const amounts = getBalancedWithdrawAmounts(budget, supply, reserves, decimals)
          return fromEntries(amounts.map((amount, index) => [poolAmountField(index), amount]))
        }) ?? getPoolDefaultValues(tokenCount ?? 0)),
      })
    },
    [update, decimals.data, reserves.data, supply.data, slippage, tokenCount],
  )

  const { error, isLoading } = combineQueryState(
    tokens,
    reserves,
    supply,
    decimals,
    maxAmounts,
    lpBalance,
    ...Object.values(preview),
  )
  const isPending = formState.isSubmitting || isWithdrawing
  return {
    form,
    reserves: q(reserves),
    maxAmounts,
    params,
    preview,
    tokens,
    onLpAmount,
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isLoading: isPending || isLoading,
    isDisabled: isPending || isDebouncing || !formState.isValid || !!error || !preview.fee.data,
    isLpDisabled: isPending || !maxAmounts.data || !supply.data || !+supply.data,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: withdrawError ?? error,
    formErrors: formState.visibleErrors,
    priceImpact: preview.priceImpact,
  }
}
