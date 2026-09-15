import { identity } from 'lodash'
import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { useDepositMutation } from '@/stellar/mutations/deposit.mutation'
import { usePoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { usePoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { depositFormValidationSuite, type DepositForm } from '@/stellar/queries/validation/deposit.validation'
import { zip } from '@primitives/array.utils'
import { maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, type PoolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { useDepositPreview, type DepositPreviewParams } from './useDepositPreview'
import { useDepositTokens } from './useDepositTokens'

const formOptions = {
  validation: depositFormValidationSuite,
  defaultValues: { decimals: undefined, supply: undefined, slippage: SLIPPAGE.stable.default },
}

export function useDepositForm(poolParams: PoolQuery) {
  const { network, pool } = poolParams
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const config = usePoolConfig(poolParams)
  const supply = usePoolSupply(poolParams)
  const tokens = mapQuery(config, config => config.tokens)
  const tokenCount = tokens.data?.length

  const { metadata, balances, decimals, maxAmounts } = useDepositTokens({ ...poolParams, account, tokens })
  const slippage = useUserProfileStore(state => state.maxSlippage.stable)
  const userDefaultValues = useMemo(() => maybe(tokenCount, getPoolDefaultValues) ?? {}, [tokenCount])
  const form = useForm<DepositForm>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { formState, reset } = form

  useFormSync(form, { slippage })
  useFormSync(form, { decimals: decimals.data })
  useFormSync(form, { supply: supply.data })
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
    decimals: decimals.data,
    tokens: tokens.data,
    maxAmounts: maxAmounts.data,
    supply: supply.data,
    quote: quote.data,
    minMint: minimum.data,
    slippage,
    onReset: useCallback(() => reset(userDefaultValues), [reset, userDefaultValues]),
  })

  const isPending = formState.isSubmitting || isDepositing
  const tokenInputs = combineQueries([tokens, metadata], (addresses, metadata) =>
    zip(addresses, metadata, balances).map(([address, metadata, balance]) => ({
      address: asAddress(address),
      symbol: metadata.symbol,
      balance,
    })),
  )
  const { error, isLoading } = combineQueryState(
    tokenInputs,
    supply,
    decimals,
    maxAmounts,
    quote,
    minimum,
    priceImpact,
    fee,
  )
  return {
    form,
    params,
    preview,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled:
      isPending ||
      isDebouncing ||
      !form.formState.isValid ||
      !!error ||
      !quote.data ||
      minimum.data == null ||
      !fee.data,
    isLoading: isPending || isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: depositError ?? error,
    formErrors: form.formState.visibleErrors,
    tokens: tokenInputs,
    priceImpact,
    isSeed: mapQuery(supply, supply => !+supply),
  }
}
