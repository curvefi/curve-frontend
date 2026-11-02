import { useMemo, useState } from 'react'
import { asAddress, asStellarContract } from '@/stellar/features/connect-wallet/address'
import { getStellarTransactionFees } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { rateAdjustedValue } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { useCreatePoolMutation } from '@/stellar/mutations/create-pool.mutation'
import { useCreatePoolSimulation } from '@/stellar/queries/create-pool/create-pool-simulation.query'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import { createPoolFormValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { StellarUrls } from '@/stellar/routes/routes'
import { completeArray } from '@primitives/array.utils'
import { maybe, recordValues, repeat } from '@primitives/objects.utils'
import { POOL_TYPES } from '@ui/features/create-pool/constants'
import type { CreatePoolFormProps, CreatePoolFormValues } from '@ui/features/create-pool/types'
import { useForm, type UseFormReturn, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { STELLAR_POOL_LIMITS } from './constants'
import type { CreatedPool, CreatePoolParams } from './types'
import { useCreatePoolTokenOptions } from './useCreatePoolTokenOptions'
import { useInitialLiquidity } from './useInitialLiquidity'

const userDefaultValues = {
  tokens: repeat(undefined, STELLAR_POOL_LIMITS.tokens.min),
  poolType: undefined,
  preset: 'custom',
  amplification: undefined,
  fee: undefined,
  feeMultiplier: undefined,
  priceOracleAveragingWindow: undefined,
  poolName: '',
  symbol: '',
  addLiquidity: false,
  slippage: SLIPPAGE.stable.default,
  ...getPoolDefaultValues(STELLAR_POOL_LIMITS.tokens.min),
} satisfies Partial<CreatePoolFormValues>

const formOptions = {
  validation: createPoolFormValidationSuite,
  defaultValues: { ...userDefaultValues, decimals: undefined, maxAmounts: undefined },
}

function checkStepsCompleted({ values, formState }: Pick<UseFormReturn<CreatePoolFormValues>, 'formState' | 'values'>) {
  const isStepComplete = (...fields: (keyof CreatePoolFormValues)[]) =>
    formState.isDirty && fields.every(field => !formState.errors[field])
  return {
    tokens: isStepComplete('tokens'),
    'pool-type': isStepComplete('poolType'),
    parameters: isStepComplete('poolType', 'amplification', 'fee', 'feeMultiplier', 'priceOracleAveragingWindow'),
    liquidity:
      isStepComplete('poolType') &&
      (!values.addLiquidity ||
        isStepComplete('decimals', 'slippage', ...values.tokens.map((_, index) => poolAmountField(index)))),
    name: isStepComplete('poolName', 'symbol'),
  }
}

export function useCreatePoolForm({ network }: NetworkQuery): CreatePoolFormProps {
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const [tokenSearch, setTokenSearch] = useState('')
  const tokenOptions = useCreatePoolTokenOptions(network, tokenSearch)
  const [created, setCreated] = useState<CreatedPool>()
  const form = useForm<CreatePoolFormValues>(formOptions)
  const { values, formState, update } = form
  const { factories, nativeCurrency, explorerUrl } = STELLAR_NETWORKS[network]
  const poolTypes = recordValues(POOL_TYPES).map(type => ({
    ...type,
    disabled: !factories.some(factory => factory.type === type.id),
  }))
  const { address: factory, implementationIndex } = factories.find(factory => factory.type === values.poolType) ?? {}
  const coins = completeArray(values.tokens)?.map(token => asStellarContract(token.address))
  const { decimalsData, maxAmounts } = usePoolTokens({ network, account, tokenAddresses: coins }) ?? {}
  const balances = useMemo(() => maxAmounts?.map(balance => balance.data), [maxAmounts])
  useFormSync(form, { decimals: decimalsData, maxAmounts: balances })

  // suggest names from tokens; preserve names the user has edited.
  const symbols = completeArray(values.tokens)?.map(token => token.symbol)
  useFormSync(form, { poolName: symbols?.join('/') ?? '' }, !formState.dirtyFields.poolName)
  useFormSync(form, { symbol: symbols?.join('') ?? '' }, !formState.dirtyFields.symbol)

  const debounceDefaults = useMemo(
    () => ({ ...userDefaultValues, ...getPoolDefaultValues(values.tokens.length) }),
    [values.tokens.length],
  )
  const [params, isDebouncing] = useFormDebounce<CreatePoolParams, keyof typeof debounceDefaults>(
    { ...values, network, factory, implementationIndex, account, coins },
    debounceDefaults,
  )
  const simulation = useCreatePoolSimulation(
    { ...params, coins: completeArray(params.tokens)?.map(token => asStellarContract(token.address)) },
    !created,
  )
  const liquidity = useInitialLiquidity({
    network,
    account,
    pool: created?.pool,
    tokens: completeArray(created?.values.tokens)?.map(token => asStellarContract(token.address)),
    autoDeposit: created?.values.addLiquidity && created.values,
    params,
  })

  const deployment = useCreatePoolMutation({ network, factory, implementationIndex, onSuccess: setCreated })

  const isPending = formState.isSubmitting || deployment.isPending || liquidity.isPending
  const amounts = values.tokens.map((_, index) => values[poolAmountField(index)])
  const prices = useTokenUsdRates({ network, tokenAddresses: coins })

  return {
    form,
    maxAmounts,
    totalDepositValueUsd: coins
      ? combineQueries(
          coins.map(coin => prices[coin]),
          (...rates) => rateAdjustedValue(amounts, rates),
        )
      : DISABLED_Q,
    blockchainId: network,
    poolTypes,
    tokenCountRange: STELLAR_POOL_LIMITS.tokens,
    tokenSearch,
    onTokenSearch: setTokenSearch,
    tokenOptions,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    creationFee: mapQuery(simulation, transaction =>
      fromWei(getStellarTransactionFees(transaction).fee, nativeCurrency.decimals),
    ),
    nativeSymbol: nativeCurrency.symbol,
    created: maybe(created, ({ pool }) => ({ explorerUrl: `${explorerUrl}contract/${pool}` })),
    poolListUrl: StellarUrls.poolList({ network }),
    isFunded: liquidity.isSuccess,
    isDepositing: liquidity.isDepositing,
    isPending,
    isLoading: isPending || simulation.isLoading || liquidity.isLoading,
    inputsDisabled: isPending || !!created,
    completed: checkStepsCompleted({ values, formState }),
    setTokens: tokens =>
      update({ tokens, ...getPoolDefaultValues(values.tokens.length), ...getPoolDefaultValues(tokens.length) }),
    error: deployment.error ?? liquidity.error ?? simulation.error,
    formErrors: formState.visibleErrors,
    isDisabled:
      isPending || liquidity.isSuccess || isDebouncing || !formState.isValid || (!!created && !values.addLiquidity),
    onSubmit: form.handleSubmit(values => (created ? liquidity.onSubmit(values) : deployment.mutate(values))),
  }
}
