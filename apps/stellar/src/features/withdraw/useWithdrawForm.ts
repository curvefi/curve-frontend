import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useWithdrawPriceImpact } from '@/stellar/features/withdraw/useWithdrawPriceImpact'
import { calculateExpectedBurn, calculateMaximumBurn, LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves, useScaleReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { withdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolAmounts, getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import type { WithdrawFormValues } from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawFormQuery } from './types'

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
    slippage: SLIPPAGE.stable.default,
  },
}

export function useWithdrawForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const supply = usePoolSupply(poolParams)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const tokenCount = tokenAddresses.data?.length

  const { tokens, decimals, trustlineTokens } = usePoolTokens({ ...poolParams, account, tokenAddresses })
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const reserves = usePoolReserves(poolParams)
  const maxAmounts = useScaleReserves(reserves, decimals)
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
  const [params, isDebouncing] = useFormDebounce<WithdrawFormQuery, PoolAmountField | 'lpAmount'>(
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
        maxAmounts: maxAmounts.data,
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
        maxAmounts.data,
      ],
    ),
    userDefaultValues,
  )
  const quote = useExpectedLp({ ...params, amounts: getPoolAmounts(params, params.tokenCount), isDeposit: false })
  const expected = mapQuery(quote, calculateExpectedBurn)
  const maximum = mapQuery(expected, value => calculateMaximumBurn(value, params.slippage))
  const priceImpact = useWithdrawPriceImpact(
    { ...params, amounts: getPoolAmounts(params, params.tokenCount) },
    expected,
  )

  useFormSync(form, {
    decimals: decimals.data,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    maximumBurn: maximum.data,
  })

  const {
    onSubmit,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWithdrawMutation({
    ...poolParams,
    account,
    tokens: tokenAddresses.data,
    quote: quote.data,
    onReset: () => reset(userDefaultValues),
  })

  const isPending = formState.isSubmitting || isWithdrawing
  return {
    form,
    reserves: q(reserves),
    decimals: q(decimals),
    lpTokenDecimals: LP_TOKEN_DECIMALS,
    maxAmounts,
    params,
    supply: q(supply),
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled:
      isPending ||
      isDebouncing ||
      !formState.isValid ||
      trustlineTokens.length > 0 ||
      shouldBlockTransaction(priceImpact),
    isLoading: isPending || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: withdrawError,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    tokens,
    trustlineTokens,
  }
}
