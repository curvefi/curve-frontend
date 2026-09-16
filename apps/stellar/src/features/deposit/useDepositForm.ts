import { identity } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { useDepositMutation } from '@/stellar/mutations/deposit.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { depositFormValidationSuite, type DepositForm } from '@/stellar/queries/validation/deposit.validation'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { useDepositPreview, type DepositPreviewParams } from './useDepositPreview'

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
  const slippage = useUserProfileStore(state => state.maxSlippage.stable)
  const userDefaultValues = useMemo(
    () => ({ ...maybe(tokenCount, getPoolDefaultValues), isBalanced: false }),
    [tokenCount],
  )
  const form = useForm<DepositForm>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, reset } = form

  useFormSync(form, { slippage, decimals: decimals.data, supply: supply.data })
  useEffect(() => reset(userDefaultValues), [reset, userDefaultValues]) // cannot useFormSync with a flexible number of fields

  // Dynamic field names prevent destructuring dependencies; keep the values stable between actual changes.
  const values = useShallow(identity<DepositForm>)(form.watchValues())
  const [params, isDebouncing] = useFormDebounce<DepositPreviewParams, PoolAmountField>(
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
        maxAmounts: maxAmounts.data,
      }),
      [values, network, pool, account, tokenCount, decimals.data, slippage, supply.data, maxAmounts.data],
    ),
    userDefaultValues,
  )
  const preview = useDepositPreview(params)
  const { quote, minimum, priceImpact, fee } = preview

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
  const { error, isLoading } = combineQueryState(
    tokenInputs,
    supply,
    reserves,
    decimals,
    maxAmounts,
    quote,
    minimum,
    priceImpact,
    fee,
  )
  return {
    form,
    reserves: q(reserves),
    params,
    preview,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled:
      isPending || isDebouncing || !formState.isValid || !!error || !quote.data || minimum.data == null || !fee.data,
    isLoading: isPending || isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: depositError ?? error,
    formErrors: formState.visibleErrors,
    tokens: tokenInputs,
    priceImpact,
    isSeed: mapQuery(supply, supply => !+supply),
  }
}
