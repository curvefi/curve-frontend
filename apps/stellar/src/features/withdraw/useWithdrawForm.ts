import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useWithdrawPriceImpact } from '@/stellar/features/withdraw/useWithdrawPriceImpact'
import { calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolParams, PoolQuery } from '@/stellar/queries/query-types'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { withdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { getWithdrawMaxAmountQueryOptions } from '@/stellar/queries/withdraw/withdraw-max-amounts.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useQueries } from '@tanstack/react-query'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolAmounts, getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import {
  getSingleCoinWithdrawIndex,
  type WithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q, type Query, type QueryProp } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawFormQuery } from './types'

const formOptions = {
  validation: withdrawFormValidationSuite,
  defaultValues: {
    isBalanced: false,
    lpAmount: undefined,
    maxLpAmount: undefined,
    maxWithdrawIndex: undefined,
    decimals: undefined,
    supply: undefined,
    seedLock: undefined,
    maximumBurn: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

const useWithdrawMaxAmounts = ({
  decimals,
  lpBalance,
  tokenAddresses,
  ...poolParams
}: PoolParams & {
  decimals: Query<(number | undefined)[]>
  lpBalance: Query<Decimal>
  tokenAddresses: QueryProp<StellarContract[]>
}) =>
  useQueries({
    queries:
      tokenAddresses.data?.map((_, index) =>
        getWithdrawMaxAmountQueryOptions({
          ...poolParams,
          index,
          decimals: decimals.data?.[index],
          lpAmount: lpBalance.data,
        }),
      ) ?? [],
    combine: results => results.map(q),
  })

export function useWithdrawForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const supply = usePoolSupply(poolParams)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const tokenCount = tokenAddresses.data?.length

  const { tokens, decimals } = usePoolTokens({ ...poolParams, account, tokenAddresses })
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const reserves = q(usePoolReserves({ ...poolParams, decimals: decimals.data }))
  const maxAmounts = useWithdrawMaxAmounts({ ...poolParams, tokenAddresses, decimals, lpBalance })
  const userDefaultValues = useMemo(
    () => ({ ...maybe(tokenCount, getPoolDefaultValues), lpAmount: undefined, maxWithdrawIndex: undefined }),
    [tokenCount],
  )
  const form = useForm<WithdrawFormValues>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, reset } = form

  // Dynamic field names prevent destructuring dependencies; keep the values stable between actual changes.
  const values = useShallow(identity<WithdrawFormValues>)(form.watchValues())
  const [params, isDebouncing] = useFormDebounce<WithdrawFormQuery, PoolAmountField | 'lpAmount' | 'maxWithdrawIndex'>(
    useMemo(
      () => ({
        ...values,
        network,
        pool,
        account,
        tokenCount,
        decimals: decimals.data,
        slippage: values.slippage,
        supply: supply.data,
        seedLock: config.data?.seedLock,
        maxLpAmount: lpBalance.data,
        maxAmounts: maxAmounts.map(q => q.data),
      }),
      [
        values,
        network,
        pool,
        account,
        tokenCount,
        decimals.data,
        supply.data,
        config.data?.seedLock,
        lpBalance.data,
        maxAmounts,
      ],
    ),
    userDefaultValues,
  )
  const queryParams = { ...params, amounts: getPoolAmounts(params, params.tokenCount) }
  const expectedLp = q(useExpectedLp({ ...queryParams, isDeposit: false }))
  const maximumLp = mapQuery(expectedLp, value =>
    getSingleCoinWithdrawIndex(queryParams) == null ? calculateMaximumBurn(value, params.slippage) : value,
  )
  const priceImpact = useWithdrawPriceImpact(queryParams, expectedLp)

  useFormSync(form, {
    decimals: decimals.data,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    maximumBurn: maximumLp.data,
  })
  useFormSync(form, { lpAmount: lpBalance.data }, values.maxWithdrawIndex != null && lpBalance.data != null)

  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues, network, pool, account]) // cannot useFormSync with a flexible number of fields

  const {
    onSubmit,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWithdrawMutation({
    ...poolParams,
    account,
    tokens: tokenAddresses.data,
    expected: expectedLp.data,
    onReset: () => reset(userDefaultValues),
  })

  const isPending = formState.isSubmitting || isWithdrawing
  return {
    form,
    reserves,
    decimals: q(decimals),
    lpTokenDecimals: LP_TOKEN_DECIMALS,
    maxAmounts,
    expectedLp,
    maximumLp,
    params,
    supply: q(supply),
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact),
    isLoading: isPending || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: withdrawError,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    tokens,
  }
}
