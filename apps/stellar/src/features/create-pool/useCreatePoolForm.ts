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
import { fromEntries, maybe, notFalsy, notFalsyArray, range, recordEntries } from '@primitives/objects.utils'
import {
  createPoolTokenDecimalsField,
  createPoolTokenField,
  createPoolTokenSymbolField,
  getCreatePoolTokenDefaults,
  getCreatePoolTokens,
} from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormProps, CreatePoolFormValues } from '@ui/features/create-pool/types'
import { useForm, type UseFormReturn, useFormSync } from '@ui/features/forms'
import { getPoolDefaultValues, poolAmountField } from '@ui/features/pool-forms/pool-form.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { DISABLED_Q, mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { STELLAR_POOL_LIMITS } from './constants'
import { getCreatePoolTypes, getCreatePoolValues, getPoolTypeDefaults } from './create-pool.utils'
import { useCreatePoolFactory } from './useCreatePoolFactory'
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
  poolName: undefined,
  symbol: undefined,
  addLiquidity: false,
  ...getPoolDefaultValues(STELLAR_POOL_LIMITS.tokens.min),
} satisfies Partial<CreatePoolFormValues>

function checkStepsCompleted({ values, formState }: Pick<UseFormReturn<CreatePoolFormValues>, 'formState' | 'values'>) {
  const { addLiquidity, tokenCount } = values
  const steps = recordEntries({
    tokens: ['tokenCount', ...range(tokenCount).map(createPoolTokenField)],
    'pool-type': ['poolType'],
    parameters: ['amplification', 'fee', 'feeMultiplier', 'priceOracleAveragingWindow'],
    liquidity: notFalsyArray(
      ['poolType'],
      addLiquidity && [
        ...range(tokenCount).map(createPoolTokenDecimalsField),
        ...range(tokenCount).map(poolAmountField),
      ],
    ),
    name: ['poolName', 'symbol'],
  } satisfies Record<string, (keyof CreatePoolFormValues)[]>)
  const nextStepIndex = steps.findIndex(([, fields]) =>
    fields.some(field => values[field] == null || formState.errors[field]),
  )
  return fromEntries(steps.map(([step], index) => [step, nextStepIndex < 0 || index < nextStepIndex]))
}

export function useCreatePoolForm({ network: networkId }: NetworkQuery): CreatePoolFormProps {
  const network = STELLAR_NETWORKS[networkId]
  const { nativeCurrency, explorerUrl } = network
  const poolTypes = getCreatePoolTypes(networkId)
  const { address: account, connect, isConnected, isConnecting } = useWallet()
  const [tokenSearch, setTokenSearch] = useState('')
  const tokenOptions = useCreatePoolTokenOptions(networkId, tokenSearch, account)
  const form = useForm<CreatePoolFormValues>({
    validation: createPoolFormValidationSuite,
    defaultValues: { ...userDefaultValues, maxAmounts: undefined, ...getPoolTypeDefaults(poolTypes) },
  })
  const { values, formState, update } = form
  const tokens = getCreatePoolTokens(values, values.tokenCount)
  const factoryQuery = useCreatePoolFactory({
    network: networkId,
    poolType: values.poolType,
    tokenCount: values.tokenCount,
  })
  const { factory, implementationIndex, wasmHash, isAvailable: hasFactory } = factoryQuery.data ?? {}
  const deployment = useCreatePoolMutation({ network: networkId, factory, implementationIndex, wasmHash })
  const created = deployment.data
  const coins = tokens.map(token => asStellarContract(token?.address))
  const selectedCoins = notFalsy(...coins)
  const { decimalsData, maxAmounts } =
    usePoolTokens({ network: networkId, account, tokenAddresses: completeArray(coins) }) ?? {}
  const balances = useMemo(() => maxAmounts?.map(balance => balance.data), [maxAmounts])
  useFormSync(form, {
    ...fromEntries(range(values.tokenCount).map(index => [createPoolTokenDecimalsField(index), decimalsData?.[index]])),
    maxAmounts: balances,
  })

  // suggest names from tokens; preserve names the user has edited.
  const symbols = notFalsy(...tokens.map(token => token?.symbol))
  useFormSync(form, { poolName: symbols.join('/') || undefined }, !formState.dirtyFields.poolName)
  useFormSync(form, { symbol: symbols.join('') || undefined }, !formState.dirtyFields.symbol)

  const debounceDefaults = useMemo(
    () => ({
      ...userDefaultValues,
      ...getCreatePoolTokenDefaults(values.tokenCount),
      ...getPoolDefaultValues(values.tokenCount),
    }),
    [values.tokenCount],
  )
  const [params, isDebouncing] = useFormDebounce(values, debounceDefaults)
  const simulation = useCreatePoolSimulation(
    { ...getCreatePoolValues(params), network: networkId, account, factory, implementationIndex, wasmHash },
    !isDebouncing,
  )
  const liquidity = useInitialLiquidity({
    ...params,
    network: networkId,
    account,
    pool: created?.pool,
    autoDeposit: created?.values.addLiquidity && created.values,
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
    availability: mapQuery(factoryQuery, data => data.tokenCounts),
    wallet: { connect, isConnected, isConnecting },
    userAddress: asAddress(account),
    creationFee: mapQuery(simulation, transaction =>
      fromWei(getStellarTransactionFees(transaction).fee, nativeCurrency.decimals),
    ),
    created: maybe(created, ({ pool }) => ({
      explorerUrl: `${explorerUrl}contract/${pool}`,
      depositUrl: StellarPages.pool({ network: networkId, pool }),
    })),
    expectedLp: liquidity.expectedLp,
    isFunded: liquidity.isSuccess,
    transactions: notFalsy(
      { label: t`Deploy pool`, status: deployment.status },
      values.addLiquidity && { label: t`Add liquidity`, status: liquidity.status },
    ),
    isPending,
    isLoading: isPending || factoryQuery.isLoading || simulation.isLoading || liquidity.isLoading,
    inputsDisabled: isPending || !!created,
    completed: checkStepsCompleted({ values, formState }),
    setTokens: tokens =>
      update({
        tokenCount: tokens.length,
        ...getCreatePoolTokenDefaults(values.tokenCount),
        ...fromEntries(
          tokens.flatMap((token, index) => [
            [createPoolTokenField(index), token?.address],
            [createPoolTokenSymbolField(index), token?.symbol],
          ]),
        ),
        ...getPoolDefaultValues(values.tokenCount),
      }),
    error: deployment.error ?? liquidity.error ?? simulation.error,
    formErrors: formState.visibleErrors,
    isDisabled:
      isPending || liquidity.isSuccess || isDebouncing || !formState.isValid || !hasFactory || !!factoryQuery.error,
    onSubmit: form.handleSubmit(values => (created ? liquidity.onSubmit(values) : deployment.onSubmit(values))),
  }
}
