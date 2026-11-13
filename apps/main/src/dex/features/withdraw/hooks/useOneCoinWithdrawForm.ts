import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import { usePoolTokens } from '@/dex/features/pool/usePoolTokens'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenDepositBalances } from '@/dex/hooks/usePoolTokenDepositBalances'
import { hasWrapped } from '@/dex/pool.utils'
import { usePoolCurrencyReserves } from '@/dex/queries/pool-currency-reserves.query'
import { usePoolParameters } from '@/dex/queries/pool-parameters.query'
import { useWithdrawPriceImpact } from '@/dex/queries/withdraw/withdraw-bonus.query'
import { useWithdrawLp } from '@/dex/queries/withdraw/withdraw-expected.query'
import { useWithdrawMaxAmount } from '@/dex/queries/withdraw/withdraw-max-amounts.query'
import { isLoading, useWallet } from '@evm-ui/features/connect-wallet'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
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
      isWrapped: initialWrapped,
      tokenIndex: 0,
      slippage: maxSlippage,
      decimals: undefined,
      maxLpAmount: undefined,
      poolReserve: undefined,
      expected: undefined,
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

  // Max needs one-coin quote for the entire LP balance. For lending pools with zap, curve-js has no withdrawOneCoinWrappedExpected implementation, so wrapped-token Max is unavailable
  const canWithdrawOneCoin = !isWrapped || !pool?.isLending || !pool.zap
  const max = q(useWithdrawMaxAmount({ ...poolParams, index, lpAmount: lpBalance.data }, canWithdrawOneCoin))

  const [debounced, isDebouncing] = useFormDebounce(values, userDefaultValues)
  const params: WithdrawQuoteParams = { ...getOneCoinWithdrawParams(debounced), ...poolParams }
  const { expectedLp, maximumLp } = useWithdrawLp(params)
  const priceImpact = useWithdrawPriceImpact(params)

  useFormSync(form, {
    decimals,
    supply: supply.data,
    maxLpAmount: lpBalance.data,
    poolReserve: reserves.data?.[index],
    expected: expectedLp.data,
  })

  // Keep Max selected as the quote changes, including while its amount is unavailable.
  useFormSync(form, { amount: max.data }, values.isMax)

  // Apply the resolved pool's default without replacing a user's slippage choice.
  useFormSync(form, { slippage: maxSlippage }, pool != null && !form.isTouched('slippage'))

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
    inputDisabled: isPending || !tokens?.[index]?.data || !supply.data || !+supply.data,
    canWithdrawWrapped: !!hasWrapped(pool),
    wallet: { connect, isConnected: !!wallet, isConnecting: isLoading(connectState) },
    userAddress,
    onSlippageChange: (slippage: Decimal) => update({ slippage }),
    onCoinChange: (tokenIndex: number) => update({ ...userDefaultValues, tokenIndex }),
    onMax,
    onAmountChange: (amount: Decimal | undefined) =>
      maybes([amount, max.data], decimalEqual) ? onMax() : update({ amount, isMax: false }),
    onSubmit: handleSubmit(onSubmit),
    isPending,
    isLoading: isPoolLoading || isPending || priceImpact.isLoading || expectedLp.isLoading,
    isDisabled:
      pool == null ||
      !formState.isValid ||
      isPending ||
      isDebouncing ||
      shouldBlockTransaction(priceImpact) ||
      (values.isMax && (!canWithdrawOneCoin || !max.data)),
    error,
    formErrors: formState.visibleErrors,
  }
}
