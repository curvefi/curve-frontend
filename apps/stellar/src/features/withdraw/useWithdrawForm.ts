import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { withdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
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
  const { formState, reset } = form

  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues]) // cannot useFormSync with a flexible number of fields

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
  const { quote, maximum, gas } = preview

  useFormSync(form, {
    slippage,
    decimals: decimals.data,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    quote: quote.data,
    maximumBurn: maximum.data,
  })

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

  const isPending = formState.isSubmitting || isWithdrawing
  const { error, isLoading } = combineQueryState(
    tokenInputs,
    reserves,
    supply,
    decimals,
    maxAmounts,
    lpBalance,
    ...Object.values(preview),
  )
  return {
    form,
    reserves: q(reserves),
    decimals: q(decimals),
    lpTokenDecimals: LP_TOKEN_DECIMALS,
    maxAmounts,
    params,
    preview,
    supply: q(supply),
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || !!error || !gas.data,
    isLoading: isPending || isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: withdrawError ?? error,
    formErrors: formState.visibleErrors,
    tokens: tokenInputs,
  }
}
