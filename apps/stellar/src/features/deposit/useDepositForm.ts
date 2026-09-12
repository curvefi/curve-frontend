import { useCallback, useMemo } from 'react'
import { asAddress } from '@/features/connect-wallet/address'
import { useWallet } from '@/features/connect-wallet/useWallet'
import { useDepositMutation } from '@/mutations/deposit.mutation'
import { usePoolConfig } from '@/queries/pool/pool-config.query'
import { usePoolSupply } from '@/queries/pool/pool-supply.query'
import type { PoolQuery } from '@/queries/root-keys'
import { depositFormValidationSuite, type DepositFormValues } from '@/queries/validation/deposit.validation'
import { zip } from '@primitives/array.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { assert, maybe, range } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { combineQueries, combineQueryState } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { useDepositPreview } from './useDepositPreview'
import { useDepositTokens } from './useDepositTokens'

const formOptions = {
  validation: depositFormValidationSuite,
  defaultValues: {
    amounts: undefined,
    decimals: undefined,
    maxAmounts: undefined,
    supply: undefined,
    slippage: SLIPPAGE.stable.default,
  },
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
  const userDefaultValues = useMemo(
    () => ({ amounts: maybe(tokenCount, tokenCount => range(tokenCount).map(() => undefined)) }),
    [tokenCount],
  )
  const form = useForm<DepositFormValues>({
    ...formOptions,
    defaultValues: { ...formOptions.defaultValues, ...userDefaultValues },
  })
  const { getValue, reset, update } = form

  useFormSync(form, { slippage })
  useFormSync(form, { decimals: decimals.data })
  useFormSync(form, { maxAmounts: maxAmounts.data })
  useFormSync(form, { supply: supply.data })
  useFormSync(form, userDefaultValues)

  const { amounts } = form.watchValues()

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
        network,
        pool,
        account,
        amounts,
        decimals: decimals.data,
        slippage,
        supply: supply.data,
        maxAmounts: maxAmounts.data,
      }),
      [network, pool, account, amounts, decimals.data, slippage, supply.data, maxAmounts.data],
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

  const isPending = form.formState.isSubmitting || isDepositing
  const tokenInputs = combineQueries([tokens, metadata], (addresses, metadata) =>
    zip(addresses, metadata, balances).map(([address, metadata, balance]) => ({
      address: asAddress(address),
      symbol: metadata.symbol,
      balance,
    })),
  )
  const dataState = combineQueryState(tokenInputs, supply, decimals, maxAmounts, quote, minimum, priceImpact, fee)
  const onAmount = useCallback(
    (index: number, value: Decimal | undefined) =>
      update({ amounts: assert(getValue('amounts'), 'Missing amounts').map((amt, i) => (i === index ? value : amt)) }),
    [getValue, update],
  )
  return {
    form,
    params,
    preview,
    amounts,
    onAmount,
    onSubmit: form.handleSubmit(onSubmit),
    isPending,
    isDisabled:
      isPending ||
      isDebouncing ||
      !form.formState.isValid ||
      !!dataState.error ||
      !quote.data ||
      !+quote.data ||
      minimum.data == null ||
      !fee.data,
    isLoading: isPending || dataState.isLoading,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    error: depositError ?? dataState.error,
    formErrors: form.formState.visibleErrors,
    tokens: tokenInputs,
    priceImpact,
    isSeed: supply.data != null && !+supply.data,
  }
}
