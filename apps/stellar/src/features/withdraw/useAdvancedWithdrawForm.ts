import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useWithdrawPriceImpact } from '@/stellar/features/withdraw/useWithdrawPriceImpact'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSnapshot } from '@/stellar/queries/pool/pool-snapshot.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { advancedWithdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { useWithdrawLp } from '@/stellar/queries/withdraw/withdraw-lp.query'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, range } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import {
  getPoolDefaultValues,
  LP_TOKEN_DECIMALS,
  poolMaxAmountField,
  poolAmountField,
  type PoolAmountField,
} from '@ui/features/pool-forms/pool-form.utils'
import { createBalancedWithdraw } from '@ui/features/pool-forms/withdraw/createBalancedWithdraw'
import {
  getAdvancedWithdrawParams,
  type AdvancedWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawQuoteParams } from './types'

const formOptions = {
  validation: advancedWithdrawFormValidationSuite,
  defaultValues: {
    maxLpAmount: undefined,
    decimals: undefined,
    supply: undefined,
    seedLock: undefined,
    maximumBurn: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

export function useAdvancedWithdrawForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const snapshot = usePoolSnapshot(poolParams)
  const supply = mapQuery(snapshot, snapshot => snapshot.lp_supply)
  const reserves = mapQuery(snapshot, snapshot => snapshot.active_balances)
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const tokenCount = tokenAddresses.data?.length

  const { tokens, decimalsData } = usePoolTokens({ ...poolParams, account, tokenAddresses }) ?? {}
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const userDefaultValues = useShallow((tokenCount: number | undefined) => ({
    ...maybe(tokenCount, getPoolDefaultValues),
    lpAmount: undefined,
    isBalanced: true,
  }))(tokenCount)
  const form = useForm<AdvancedWithdrawFormValues>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, handleSubmit, update, reset, values } = form

  const [debounced, isDebouncing] = useFormDebounce<
    AdvancedWithdrawFormValues,
    PoolAmountField | 'lpAmount' | 'isBalanced'
  >(values, userDefaultValues)
  const params: WithdrawQuoteParams = { ...getAdvancedWithdrawParams(debounced), ...poolParams, account }
  const { expectedLp, maximumLp } = useWithdrawLp(params)
  const priceImpact = useWithdrawPriceImpact(params, expectedLp)

  useFormSync(form, {
    decimals: decimalsData,
    supply: supply.data,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    maximumBurn: maximumLp.data,
    ...maybe(tokenCount, count =>
      fromEntries(range(count).map(index => [poolMaxAmountField(index), reserves.data?.[index]])),
    ),
  })

  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues, network, pool, account]) // cannot useFormSync with a flexible number of fields

  const {
    onSubmit,
    isPending: isWithdrawing,
    error,
  } = useWithdrawMutation({
    ...poolParams,
    account,
    tokens: tokenAddresses.data,
    expected: expectedLp.data,
    onReset: () => reset(userDefaultValues),
  })

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
    canBalance,
    lpAmountUsd: lpAmountUsd.data,
    onLpChange: (lpAmount: Decimal | undefined) => update(getUpdatesFromLpAmount(lpAmount)),
    onBalancedChange: (isBalanced: boolean) =>
      update({ ...(isBalanced && getUpdatesFromLpAmount(values.lpAmount)), isBalanced }),
    onTokenChange: (index: number, amount: Decimal | undefined) =>
      update({ ...(values.isBalanced && getUpdatesFromTokenAmount(index, amount)), [poolAmountField(index)]: amount }),
    form,
    expectedLp,
    maximumLp,
    priceImpact,
    params,
    lpBalance: q(lpBalance),
    onSubmit: handleSubmit(values => onSubmit(getAdvancedWithdrawParams(values))),
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact),
    isLoading: isPending || config.isLoading || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => update({ slippage: newSlippage }),
    tokens,
  }
}
