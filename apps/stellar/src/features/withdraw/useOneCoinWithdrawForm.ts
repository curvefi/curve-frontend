import { useEffect } from 'react'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useWithdrawMutation } from '@/stellar/mutations/withdraw.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSnapshot } from '@/stellar/queries/pool/pool-snapshot.query'
import type { PoolQuery } from '@/stellar/queries/query-types'
import { useTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { oneCoinWithdrawFormValidationSuite } from '@/stellar/queries/validation/withdraw.validation'
import { useWithdrawMaxAmount } from '@/stellar/queries/withdraw/withdraw-max-amounts.query'
import { useWithdrawOneCoinQuote } from '@/stellar/queries/withdraw/withdraw-one-coin-quote.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { LP_TOKEN_DECIMALS } from '@ui/features/pool-forms/pool-form.utils'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import {
  getOneCoinWithdrawParams,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimalEqual } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawQuoteParams } from './types'
import { useWithdrawPriceImpact } from './useWithdrawPriceImpact'

const userDefaultValues = { amount: undefined, isMax: false }
const formOptions = {
  validation: oneCoinWithdrawFormValidationSuite,
  defaultValues: {
    ...userDefaultValues,
    lpAmount: undefined,
    quotedAmount: undefined,
    tokenIndex: 0,
    poolReserve: undefined,
    maxLpAmount: undefined,
    decimals: undefined,
    supply: undefined,
    seedLock: undefined,
    maximumBurn: undefined,
    slippage: SLIPPAGE.stable.default,
  },
}

export function useOneCoinWithdrawForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const snapshot = usePoolSnapshot(poolParams)
  const { lp_supply: supply, active_balances: reserves } = snapshot.data ?? {}
  const tokenAddresses = mapQuery(config, config => config.tokens)
  const { tokens, decimals, decimalsData } = usePoolTokens({ ...poolParams, account, tokenAddresses }) ?? {}
  const lpBalance = useTokenBalance({ network, token: pool, account, decimals: LP_TOKEN_DECIMALS })
  const form = useForm<OneCoinWithdrawFormValues>(formOptions)
  const { values, formState, reset, update, handleSubmit } = form
  const index = values.tokenIndex
  const max = q(
    useWithdrawMaxAmount({ ...poolParams, index, decimals: decimals?.[index]?.data, lpAmount: lpBalance.data }),
  )
  const [debounced, isDebouncing] = useFormDebounce(values, userDefaultValues)
  useEffect(() => {
    if (values.amount && !values.isMax && (lpBalance.data == null || decimalEqual(lpBalance.data, '0'))) {
      // eslint-disable-next-line no-console -- Temporary diagnostics for the one-coin quoting trial.
      console.log('[oneCoinWithdrawQuote] skipped', {
        network,
        pool,
        index,
        amount: values.amount,
        maxLpAmount: lpBalance.data,
        reason: lpBalance.data == null ? 'LP balance unavailable' : 'No LP position',
      })
    }
  }, [network, pool, index, values.amount, values.isMax, lpBalance.data])
  const estimated = useWithdrawOneCoinQuote({
    ...poolParams,
    amount: isDebouncing || values.isMax ? undefined : debounced.amount,
    maxLpAmount: lpBalance.data,
    decimals: decimalsData?.[index],
    index,
    slippage: values.slippage,
  })
  const quote = values.isMax ? mapQuery(max, amount => ({ lpAmount: lpBalance.data!, amount })) : q(estimated)
  const expectedLp = mapQuery(quote, quote => quote.lpAmount)
  const maximumLp = expectedLp
  const quotedAmount = quote.data?.amount
  const params: WithdrawQuoteParams = {
    ...getOneCoinWithdrawParams({ ...debounced, lpAmount: expectedLp.data, quotedAmount }),
    ...poolParams,
    account,
  }
  const priceImpact = useWithdrawPriceImpact(params, expectedLp)

  useFormSync(form, {
    decimals: decimalsData,
    supply,
    seedLock: config.data?.seedLock,
    maxLpAmount: lpBalance.data,
    poolReserve: reserves?.[index],
    maximumBurn: maximumLp.data,
    lpAmount: expectedLp.data,
    quotedAmount,
  })
  useFormSync(form, { amount: max.data }, values.isMax)
  useEffect(() => reset(userDefaultValues), [reset, network, pool, account])

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
  const isPending = formState.isSubmitting || isWithdrawing
  const onMax = () => update({ amount: max.data, isMax: true })
  return {
    form,
    tokens,
    index,
    max,
    params,
    expectedLp,
    maximumLp,
    lpBalance: q(lpBalance),
    priceImpact,
    minimumReceived: mapQuery(quote, ({ amount }) =>
      maybe(decimalsData?.[index], precision => calculateMinimumReceived(amount, values.slippage, precision)),
    ),
    toSymbol: tokens?.[index]?.data?.symbol,
    isPending,
    inputDisabled: isPending || !tokens?.[index]?.data || !supply || !+supply,
    isDisabled:
      isPending ||
      isDebouncing ||
      !formState.isValid ||
      !quote.data ||
      !!quote.error ||
      shouldBlockTransaction(priceImpact) ||
      (values.isMax && !max.data),
    isLoading: isPending || config.isLoading || priceImpact.isLoading || expectedLp.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: error ?? quote.error,
    formErrors: formState.visibleErrors,
    onSubmit: handleSubmit(values =>
      onSubmit(getOneCoinWithdrawParams({ ...values, lpAmount: expectedLp.data, quotedAmount })),
    ),
    onSlippageChange: (slippage: Decimal) => update({ slippage }),
    onCoinChange: (tokenIndex: number) => update({ ...userDefaultValues, tokenIndex }),
    onMax,
    onAmountChange: (amount: Decimal | undefined) =>
      maybes([amount, max.data], decimalEqual) ? onMax() : update({ amount, isMax: false }),
  }
}
