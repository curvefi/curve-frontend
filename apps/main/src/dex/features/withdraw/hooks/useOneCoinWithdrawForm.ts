import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawMaxAmount } from '@/dex/queries/withdraw/withdraw-max-amounts.query'
import { useWithdrawOneCoinQuote } from '@/dex/queries/withdraw/withdraw-one-coin-quote.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import {
  getOneCoinWithdrawParams,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimalEqual } from '@ui/lib/decimal'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { WithdrawQuoteParams } from '../types'
import { useWithdrawMutation } from '../withdraw.mutation'
import { oneCoinWithdrawFormValidationSuite } from '../withdraw.validation'

const userDefaultValues = { amount: undefined, isMax: false }

export const useOneCoinWithdrawForm = ({ maxSlippage }: { maxSlippage: Decimal }) => {
  const {
    chainId,
    poolAddress,
    pool: { data: pool, isLoading: isPoolLoading },
    isWrapped: initialWrapped,
    setIsWrapped,
    blockchainId,
  } = usePoolContext()
  const { address: userAddress } = useConnection()
  const { connect, connectState, wallet } = useWallet()

  const form = useForm<OneCoinWithdrawFormValues>({
    validation: oneCoinWithdrawFormValidationSuite,
    defaultValues: {
      ...userDefaultValues,
      lpAmount: undefined,
      quotedAmount: undefined,
      isWrapped: initialWrapped,
      tokenIndex: 0,
      slippage: maxSlippage,
      decimals: undefined,
      maxLpAmount: undefined,
      poolReserve: undefined,
      maximumBurn: undefined,
      supply: undefined,
      seedLock: undefined,
    },
  })
  const { formState, handleSubmit, update, reset, values } = form

  const isWrapped = values.isWrapped! // isWrapped is optional but always passed in this app.
  const index = values.tokenIndex
  const poolParams = { chainId, poolAddress, isWrapped, userAddress }
  const { tokens, decimals } = usePoolTokens({ chainId, blockchainId, pool, userAddress, isWrapped })
  const { lpTokenBalance: lpBalance } = usePoolTokenDepositBalances(poolParams)
  const reserves = mapQuery(usePoolCurrencyReserves(poolParams), data => data.tokens.map(token => token.balance))
  const supply = mapQuery(usePoolParameters(poolParams), data => data.lpTokenSupply as Decimal)

  // curve-js has no wrapped one-coin quote or withdrawal for lending pools with a zap.
  const canWithdrawWrapped = !!hasWrapped(pool) && !(pool?.isLending && pool.zap)
  const canWithdrawOneCoin = !isWrapped || canWithdrawWrapped
  const max = q(useWithdrawMaxAmount({ ...poolParams, index, lpAmount: lpBalance.data }, canWithdrawOneCoin))

  const [debounced, isDebouncing] = useFormDebounce(values, userDefaultValues)
  useEffect(() => {
    if (values.amount && !values.isMax && (lpBalance.data == null || decimalEqual(lpBalance.data, '0'))) {
      // eslint-disable-next-line no-console -- Temporary diagnostics for the one-coin quoting trial.
      console.log('[oneCoinWithdrawQuote] skipped', {
        chainId,
        poolAddress,
        index,
        amount: values.amount,
        maxLpAmount: lpBalance.data,
        reason: lpBalance.data == null ? 'LP balance unavailable' : 'No LP position',
      })
    }
  }, [chainId, poolAddress, index, values.amount, values.isMax, lpBalance.data])
  const estimated = useWithdrawOneCoinQuote(
    {
      ...poolParams,
      amount: isDebouncing || values.isMax ? undefined : debounced.amount,
      maxLpAmount: lpBalance.data,
      decimals: decimals?.[index],
      index,
      slippage: values.slippage,
    },
    canWithdrawOneCoin,
  )
  const quote = values.isMax ? mapQuery(max, amount => ({ lpAmount: lpBalance.data!, amount })) : q(estimated)
  const expectedLp = mapQuery(quote, quote => quote.lpAmount)
  const maximumLp = expectedLp
  const quotedAmount = quote.data?.amount
  const params: WithdrawQuoteParams = {
    ...getOneCoinWithdrawParams({ ...debounced, lpAmount: expectedLp.data, quotedAmount }),
    ...poolParams,
  }
  const priceImpact = useWithdrawPriceImpact(params)

  useFormSync(form, {
    decimals,
    supply: supply.data,
    maxLpAmount: lpBalance.data,
    poolReserve: reserves.data?.[index],
    maximumBurn: maximumLp.data,
    lpAmount: expectedLp.data,
    quotedAmount,
  })

  // Keep Max selected as the quote changes, including while its amount is unavailable.
  useFormSync(form, { amount: max.data }, values.isMax)

  // Apply the resolved pool's default without replacing a user's slippage choice.
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))
  useFormSync(form, { isWrapped: false }, pool != null && !canWithdrawWrapped)

  useEffect(() => setIsWrapped(isWrapped), [isWrapped, setIsWrapped])

  useEffect(() => reset({ ...userDefaultValues, tokenIndex: 0 }), [reset, isWrapped, chainId, poolAddress, userAddress])

  const {
    onSubmit,
    isPending: isWithdrawing,
    error,
  } = useWithdrawMutation({ chainId, poolAddress, onReset: () => reset(userDefaultValues) })

  const onMax = () => update({ amount: max.data, isMax: true })
  const isPending = formState.isSubmitting || isWithdrawing

  // TODO: Surface reserves and supply loading/errors in the form.
  return {
    form,
    params,
    tokens,
    index,
    max,
    lpBalance,
    expectedLp,
    maximumLp,
    priceImpact,
    minimumReceived: mapQuery(quote, ({ amount }) =>
      maybe(decimals?.[index], precision => calculateMinimumReceived(amount, values.slippage, precision)),
    ),
    toSymbol: tokens?.[index]?.data?.symbol,
    inputDisabled: isPending || !tokens?.[index]?.data || !supply.data || !+supply.data,
    canWithdrawWrapped,
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSlippageChange: (slippage: Decimal) => update({ slippage }),
    onCoinChange: (tokenIndex: number) => update({ ...userDefaultValues, tokenIndex }),
    onMax,
    onAmountChange: (amount: Decimal | undefined) =>
      maybes([amount, max.data], decimalEqual) ? onMax() : update({ amount, isMax: false }),
    onSubmit: handleSubmit(values => onSubmit({ ...values, lpAmount: expectedLp.data, quotedAmount })),
    isPending,
    isLoading: isPoolLoading || isPending || priceImpact.isLoading || expectedLp.isLoading,
    isDisabled:
      pool == null ||
      !formState.isValid ||
      isPending ||
      isDebouncing ||
      !canWithdrawOneCoin ||
      !quote.data ||
      !!quote.error ||
      shouldBlockTransaction(priceImpact) ||
      (values.isMax && (!canWithdrawOneCoin || max.data == null || max.isLoading || !!max.error)),
    error: error ?? quote.error,
    formErrors: formState.visibleErrors,
  }
}
