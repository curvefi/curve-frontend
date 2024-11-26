import { ChainParams, ChainQuery, queryFactory, rootKeys } from '@/shared/model/query'
import { chainValidationGroup } from '@/entities/chain'
import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import useStore from '@/store/useStore'
import { IExtendedPoolDataFromApi, IPoolDataFromApi } from '@curvefi/api/dist/src/interfaces'
import { useCallback } from 'react'
import type { UseQueryResult } from '@tanstack/react-query/src/types'
import { useQueries } from '@tanstack/react-query'
import { ValueMapperCached } from '@/store/createCacheSlice'

const litePoolTypes = ['factory-twocrypto', 'factory-tricrypto', 'factory-stable-ng'] as const
const poolTypes = [
  'main',
  'crypto',
  'factory',
  'factory-crvusd',
  'factory-eywa',
  'factory-crypto',
  ...litePoolTypes,
] as const
type PoolType = (typeof poolTypes)[number]

const config = {
  lite: {
    poolTypes: litePoolTypes,
    apiRoot: 'https://api-core.curve.fi/v1/',
  },
  full: {
    poolTypes: poolTypes,
    apiRoot: 'https://api.curve.fi/api',
  },
}

const { getQueryOptions: getAllPoolsOptions, isEnabled } = queryFactory({
  queryKey: (params: ChainParams) => [...rootKeys.chain(params), 'pools'] as const,
  queryFn: async ({ chainId }: ChainQuery): Promise<Record<string, IExtendedPoolDataFromApi>> => {
    const { isLite, networkId } = useStore.getState().networks.networks[chainId]
    const { apiRoot, poolTypes } = config[isLite ? 'lite' : 'full']
    const allPools = await Promise.all(
      poolTypes.map(async (poolType) => {
        const url = `${apiRoot}/getPools/${networkId}/${poolType}`
        const response = await fetch(url)
        const { data } = await response.json()
        return [poolType, data as IExtendedPoolDataFromApi] as const
      }),
    )
    return Object.fromEntries(allPools)
  },
  staleTime: '1m',
  validationSuite: createValidationSuite((data: ChainParams) => {
    chainValidationGroup(data)
    group('noWalletProviderGroup', () => {
      const provider = useStore.getState().wallet.getProvider('')
      test('provider', () => {
        enforce(provider).message('Query used when no wallet is connected').isEmpty()
      })
    })
  }),
})

const convertPool = (
  poolType: PoolType,
  {
    id,
    name,
    symbol,
    assetTypeName,
    address,
    isMetaPool,
    basePoolAddress,
    lpTokenAddress,
    gaugeAddress,
    implementation,
    implementationAddress,
    coins,
    gaugeRewards,
    usdTotal,
    totalSupply,
    amplificationCoefficient,
    gaugeCrvApy,
  }: IPoolDataFromApi,
): PoolDataCache => ({
  gauge: {
    status: { rewardsNeedNudging: false, areCrvRewardsStuckInBridge: false },
    isKilled: false,
  }, // todo: implement gauge field
  hasWrapped: false, // todo: implement
  hasVyperVulnerability: false, // todo: check
  tokenAddresses: coins.map(({ address }) => address),
  tokenAddressesAll: [...coins.map(({ address }) => address), lpTokenAddress].filter(Boolean) as string[],
  tokens: coins.map(({ symbol }) => symbol),
  tokensCountBy: {}, // todo: implement
  tokensAll: [...coins.map(({ symbol }) => symbol), ...(lpTokenAddress ? ['lpToken'] : [])],
  tokensLowercase: coins.map(({ symbol }) => symbol.toLowerCase()),
  pool: {
    id,
    name,
    address,
    ...(gaugeAddress && { gauge: { address: gaugeAddress, poolName: 'todo' } }), // todo: gauge pool name
    lpToken: lpTokenAddress,
    // todo: check following flags
    isCrypto: poolType.endsWith('crypto'),
    isNg: poolType.endsWith('-ng'),
    isFactory: poolType.startsWith('factory'),
    isLending: poolType.startsWith('factory-stable'),
    implementation, // todo: check
    referenceAsset: assetTypeName, // todo: check
  },
})

export const useApiPoolMapping = (chainId: ChainId) =>
  useQueries({
    queries: [getAllPoolsOptions({ chainId })],
    combine: useCallback(
      ([{ data: allPools }]: [UseQueryResult<Record<string, IExtendedPoolDataFromApi>>]): Record<
        string,
        PoolDataCache
      > =>
        Object.fromEntries(
          Object.entries(allPools ?? {}).flatMap(([poolType, { poolData = [] }]) =>
            poolData.map((pool) => [pool.address, convertPool(poolType as PoolType, pool)]),
          ),
        ),
      [],
    ),
  })

export const useApiTvlMapping = (chainId: ChainId) =>
  useQueries({
    queries: [getAllPoolsOptions({ chainId })],
    combine: useCallback(
      ([{ data: allPools }]: [UseQueryResult<Record<string, IExtendedPoolDataFromApi>>]): ValueMapperCached =>
        Object.fromEntries(
          Object.values(allPools ?? {}).flatMap(({ poolData = [] }) =>
            poolData.map((pool) => [pool.id, { value: pool.usdTotal.toString() }]),
          ),
        ),
      [],
    ),
  })

export const useApiVolumeMapping = (chainId: ChainId) =>
  useQueries({
    queries: [getAllPoolsOptions({ chainId })],
    combine: useCallback(
      ([{ data: allPools }]: [UseQueryResult<Record<string, IExtendedPoolDataFromApi>>]): ValueMapperCached =>
        Object.fromEntries(
          Object.values(allPools ?? {}).flatMap(({ poolData = [] }) =>
            poolData.map((pool) => [pool.id, { value: pool.totalSupply.toString() }]),
          ),
        ),
      [],
    ),
  })

export const isPoolApiEnabled = isEnabled
