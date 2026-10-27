import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useWithdrawPriceImpact } from '@/stellar/features/withdraw/useWithdrawPriceImpact'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSnapshot } from '@/stellar/queries/pool/pool-snapshot.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { advancedWithdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { useWithdrawLp } from '@/stellar/queries/withdraw/withdraw-lp.query'
import { completeArray, isComplete } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { fromEntries, maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import {
  getPoolDefaultValues,
  poolMaxAmountField,
  poolAmountField,
  type PoolAmountField,
} from '@ui/features/pool-forms/pool-form.utils'
import {
  getAdvancedWithdrawParams,
  type AdvancedWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimalDiv, decimalMultiply, decimalSum } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import { getBalancedWithdrawAmounts, getBalancedWithdrawLp } from './balanced-withdraw.utils'
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
  const { lp_supply: supply, active_balances: reserves } = snapshot.data ?? {}
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
  const { formState, reset, values } = form

  const [debounced, isDebouncing] = useFormDebounce<
    AdvancedWithdrawFormValues,
    PoolAmountField | 'lpAmount' | 'isBalanced'
  >(values, userDefaultValues)
  const params: WithdrawQuoteParams = { ...getAdvancedWithdrawParams(debounced), ...poolParams, account }
  const { expectedLp, maximumLp } = useWithdrawLp(params)
  const priceImpact = useWithdrawPriceImpact(params, expectedLp)

  useFormSync(form, {
    decimals: decimalsData,
    supply,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    maximumBurn: maximumLp.data,
    ...maybe(tokenAddresses.data, addresses =>
      fromEntries(addresses.map((_, index) => [poolMaxAmountField(index), reserves?.[index]])),
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

  const amountsUsd = reserves?.map((amount, index) =>
    maybe(tokens?.[index]?.data?.usdRate, rate => decimalMultiply(amount, rate)),
  )
  const precision = completeArray(values.decimals)
  const canBalance = supply && reserves && precision && +supply && reserves.every(b => +b)
  const getBalancedUpdates = (lpAmount: Decimal | undefined) => ({
    lpAmount,
    ...(lpAmount && canBalance
      ? fromEntries(
          getBalancedWithdrawAmounts(lpAmount, reserves, supply, precision).map((amount, i) => [
            poolAmountField(i),
            amount,
          ]),
        )
      : maybe(tokenCount, getPoolDefaultValues)),
  })
  const isPending = formState.isSubmitting || isWithdrawing
  return {
    canBalance,
    lpAmountUsd:
      supply && +supply > 0 && isComplete(amountsUsd)
        ? maybes([values.lpAmount, decimalDiv(decimalSum(...amountsUsd), supply)], decimalMultiply)
        : undefined,
    onLpChange: (lpAmount: Decimal | undefined) => form.update(getBalancedUpdates(lpAmount)),
    onBalancedChange: (isBalanced: boolean) =>
      form.update({ ...(isBalanced && getBalancedUpdates(values.lpAmount)), isBalanced }),
    onTokenChange: (index: number, amount: Decimal | undefined) =>
      form.update({
        ...(values.isBalanced &&
          canBalance &&
          getBalancedUpdates(
            maybe(amount, amount => getBalancedWithdrawLp(amount, precision[index], reserves[index], supply)),
          )),
        [poolAmountField(index)]: amount,
      }),
    form,
    expectedLp,
    maximumLp,
    priceImpact,
    params,
    lpBalance: q(lpBalance),
    onSubmit: form.handleSubmit(values => onSubmit(getAdvancedWithdrawParams(values))),
    isPending,
    isDisabled: isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact),
    isLoading: isPending || config.isLoading || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error,
    formErrors: formState.visibleErrors,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    tokens,
  }
}
