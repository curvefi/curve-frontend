import { useMemo, useState } from 'react'
import { asAddress, asStellarContract } from '@/stellar/features/connect-wallet/address'
import { getStellarTransactionFees } from '@/stellar/features/connect-wallet/stellar-wallet-kit/transaction'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { usePoolTokens } from '@/stellar/features/pool/usePoolTokens'
import { rateAdjustedValue } from '@/stellar/lib/amounts'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { useCreatePoolMutation } from '@/stellar/mutations/create-pool.mutation'
import { useCreatePoolSimulation } from '@/stellar/queries/create-pool/create-pool-simulation.query'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { useTokenUsdRates } from '@/stellar/queries/token/token-usd-rate.query'
import { createPoolFormValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { StellarPages } from '@/stellar/routes/routes'
import { completeArray } from '@primitives/array.utils'
import { fromEntries, maybe, notFalsy, range, recordValues } from '@primitives/objects.utils'
import { POOL_TYPES } from '@ui/features/create-pool/constants'
import {
  createPoolTokenField,
  getCreatePoolTokenDefaults,
  getCreatePoolTokens,
} from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormProps, CreatePoolFormValues } from '@ui/features/create-pool/types'
import { useForm, type UseFormReturn, useFormSync } from '@ui/features/forms'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { STELLAR_POOL_LIMITS } from './constants'
import type { CreatePoolParams } from './types'
import { useCreatePoolTokenOptions } from './useCreatePoolTokenOptions'
import { useInitialLiquidity } from './useInitialLiquidity'

const userDefaultValues = {
  tokenCount: STELLAR_POOL_LIMITS.tokens.min,
  ...getCreatePoolTokenDefaults(STELLAR_POOL_LIMITS.tokens.min),
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
    tokens: isStepComplete('tokenCount', ...range(values.tokenCount).map(createPoolTokenField)),
    'pool-type': isStepComplete('poolType'),
    parameters: isStepComplete('poolType', 'amplification', 'fee', 'feeMultiplier', 'priceOracleAveragingWindow'),
    liquidity:
      isStepComplete('poolType') &&
      (!values.addLiquidity ||
        isStepComplete('decimals', 'slippage', ...range(values.tokenCount).map(poolAmountField))),
    name: isStepComplete('poolName', 'symbol'),
  }
}

export function useCreatePoolForm({ network: networkId }: NetworkQuery): CreatePoolFormProps {
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const [tokenSearch, setTokenSearch] = useState('')
  const tokenOptions = useCreatePoolTokenOptions(networkId, tokenSearch)
  const form = useForm<CreatePoolFormValues>(formOptions)
  const { values, formState, update } = form
  const tokens = getCreatePoolTokens(values, values.tokenCount)
  const network = STELLAR_NETWORKS[networkId]
  const { factories, nativeCurrency, explorerUrl } = network
  const poolTypes = recordValues(POOL_TYPES).map(type => ({
    ...type,
    disabled: !factories.some(factory => factory.type === type.id),
  }))
  const { address: factory, implementationIndex } = factories.find(factory => factory.type === values.poolType) ?? {}
  const deployment = useCreatePoolMutation({ network: networkId, factory, implementationIndex })
  const created = deployment.data
  const coins = tokens.map(token => asStellarContract(token?.address))
  const selectedCoins = notFalsy(...coins)
  const { decimalsData, maxAmounts } =
    usePoolTokens({ network: networkId, account, tokenAddresses: completeArray(coins) }) ?? {}
  const balances = useMemo(() => maxAmounts?.map(balance => balance.data), [maxAmounts])
  useFormSync(form, { decimals: decimalsData, maxAmounts: balances })

  // suggest names from tokens; preserve names the user has edited.
  const symbols = notFalsy(...tokens.map(token => token?.symbol))
  useFormSync(form, { poolName: symbols.join('/') }, !formState.dirtyFields.poolName)
  useFormSync(form, { symbol: symbols.join('') }, !formState.dirtyFields.symbol)

  const debounceDefaults = useMemo(
    () => ({
      ...userDefaultValues,
      ...getCreatePoolTokenDefaults(values.tokenCount),
      ...getPoolDefaultValues(values.tokenCount),
    }),
    [values.tokenCount],
  )
  const [params, isDebouncing] = useFormDebounce<CreatePoolParams, keyof typeof debounceDefaults>(
    { ...values, network: networkId, factory, implementationIndex, account, coins },
    debounceDefaults,
  )
  const simulation = useCreatePoolSimulation(
    {
      ...params,
      coins: getCreatePoolTokens(params, params.tokenCount)?.map(token => asStellarContract(token?.address)),
    },
    !created,
  )
  const liquidity = useInitialLiquidity({
    network: networkId,
    account,
    pool: created?.pool,
    tokens: maybe(created, ({ values }) =>
      getCreatePoolTokens(values, values.tokenCount).map(token => asStellarContract(token!.address)),
    ),
    autoDeposit: created?.values.addLiquidity && created.values,
    params,
  })

  const isPending = formState.isSubmitting || deployment.isPending || liquidity.isPending
  const amounts = range(values.tokenCount).map(index => values[poolAmountField(index)])
  const prices = useTokenUsdRates({ network: networkId, tokenAddresses: selectedCoins })

  return {
    form,
    maxAmounts,
    totalDepositValueUsd: combineQueries(
      coins.map(coin => (coin ? prices[coin] : DISABLED_Q)),
      (...rates) => rateAdjustedValue(amounts, rates),
    ),
    network,
    blockchainId: networkId,
    limits: STELLAR_POOL_LIMITS,
    poolListUrl: StellarPages.pools({ network: networkId }),
    poolTypes,
    tokenSearch,
    onTokenSearch: setTokenSearch,
    tokenOptions,
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    creationFee: mapQuery(simulation, transaction =>
      fromWei(getStellarTransactionFees(transaction).fee, nativeCurrency.decimals),
    ),
    created: maybe(created, ({ pool }) => ({ explorerUrl: `${explorerUrl}contract/${pool}` })),
    isFunded: liquidity.isSuccess,
    isDepositing: liquidity.isDepositing,
    isPending,
    isLoading: isPending || simulation.isLoading || liquidity.isLoading,
    inputsDisabled: isPending || !!created,
    completed: checkStepsCompleted({ values, formState }),
    setTokens: tokens =>
      update({
        tokenCount: tokens.length,
        ...getCreatePoolTokenDefaults(values.tokenCount),
        ...fromEntries(tokens.map((token, index) => [createPoolTokenField(index), token])),
        ...getPoolDefaultValues(Math.max(values.tokenCount, tokens.length)),
      }),
    error: deployment.error ?? liquidity.error ?? simulation.error,
    formErrors: formState.visibleErrors,
    isDisabled:
      isPending || liquidity.isSuccess || isDebouncing || !formState.isValid || (!!created && !values.addLiquidity),
    onSubmit: form.handleSubmit(values => (created ? liquidity.onSubmit(values) : deployment.mutate(values))),
  }
}
