import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { useDepositPriceImpact } from '@/stellar/features/deposit/useDepositPriceImpact'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { calculateMinimumMint } from '@/stellar/lib/amounts'
import { useDepositMutation } from '@/stellar/mutations/deposit.mutation'
import { useExpectedLp } from '@/stellar/queries/pool/expected-lp.query'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { depositFormValidationSuite } from '@/stellar/queries/validation/deposit.validation'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolAmounts, getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { mapQuery, q } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { shouldBlockTransaction } from '@ui/lib/price-impact.util'
import type { DepositForm, DepositFormQuery } from './types'

const formOptions = {
  validation: depositFormValidationSuite,
  defaultValues: { isBalanced: false, decimals: undefined, supply: undefined, slippage: SLIPPAGE.stable.default },
}

export function useDepositForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const supply = usePoolSupply(poolParams)
  const reserves = usePoolReserves(poolParams)
  const tokens = mapQuery(config, config => config.tokens)
  const tokenCount = tokens.data?.length

  const { inputs: tokenInputs, decimals, maxAmounts } = usePoolTokens({ ...poolParams, account, tokens })
  const userDefaultValues = useMemo(
    () => ({ ...maybe(tokenCount, getPoolDefaultValues), isBalanced: false }),
    [tokenCount],
  )
  const form = useForm<DepositForm>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, reset } = form

  useFormSync(form, { decimals: decimals.data, supply: supply.data })
  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues]) // cannot useFormSync with a flexible number of fields

  // Dynamic field names prevent destructuring dependencies; keep the values stable between actual changes.
  const values = useShallow(identity<DepositForm>)(form.watchValues())
  const [params, isDebouncing] = useFormDebounce<DepositFormQuery, PoolAmountField>(
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
        maxAmounts: maxAmounts.data,
      }),
      [values, network, pool, account, tokenCount, decimals.data, supply.data, maxAmounts.data],
    ),
    userDefaultValues,
  )
  const quote = useExpectedLp({ ...params, amounts: getPoolAmounts(params, params.tokenCount), isDeposit: true })
  const minimum = mapQuery(quote, value => calculateMinimumMint(value, params.slippage))
  const priceImpact = useDepositPriceImpact({ ...params, amounts: getPoolAmounts(params, params.tokenCount) }, q(quote))
  const isSeed = mapQuery(supply, supply => !+supply)

  const {
    onSubmit,
    isPending: isDepositing,
    error: depositError,
  } = useDepositMutation({
    ...poolParams,
    account,
    tokens: tokens.data,
    quote: quote.data,
    minMint: minimum.data,
    onReset: () => reset(userDefaultValues),
  })

  const isPending = formState.isSubmitting || isDepositing
  return {
    form,
    reserves: q(reserves),
    params,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled:
      isPending || isDebouncing || !formState.isValid || shouldBlockTransaction(priceImpact, isSeed.data === false),
    isLoading: isPending || priceImpact.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: depositError,
    formErrors: formState.visibleErrors,
    priceImpact,
    slippage: values.slippage,
    onSlippageChange: (newSlippage: Decimal) => form.update({ slippage: newSlippage }),
    tokens: tokenInputs,
    isSeed,
  }
}
