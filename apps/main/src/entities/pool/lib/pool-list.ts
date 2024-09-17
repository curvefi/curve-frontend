import { createQueryHook } from '@/shared/lib/queries/factory'
import { getPoolsQueryOptions } from '@/entities/pool/model'
import { useMemo } from 'react'
import { IDict } from '../../../../../../../curve-js/lib/interfaces'
import { IPoolDataFromApi, IPoolType } from '@/entities/pool'
import { UseQueryResult } from '@tanstack/react-query'
import { countBy, flatten } from 'lodash'
import { shortenTokenAddress } from '@/utils'
import networks from '@/networks'

export type PoolDataFromApi = {
  tokenAddresses: string[];
  tokenAddressesAll: string[];
  tokens: string[];
  tokensCountBy: { [key: string]: number };
  tokensAll: string[];
  tokensLowercase: string[];
  usdTotal: number;
  pool: Omit<PoolDataCache['pool'], 'gauge' | 'isNg' | 'isLending'> & {
    gauge: { address: string } | null
  };
}

const usePoolsQuery = createQueryHook(getPoolsQueryOptions)

function transformToPoolDataCache(poolType: IPoolType, pool: IPoolDataFromApi, chainId: ChainId): PoolDataFromApi {
  const tokensWrapped = pool.coins.map((coin) => coin.symbol || shortenTokenAddress(coin.address)!)
  const tokens = networks[chainId].poolIsWrappedOnly[pool.id] ? tokensWrapped : tokensWrapped
  const tokensLowercase = tokens.map((c) => c.toLowerCase())
  const tokensAll = flatten([tokens])
  const tokenAddressesAll = flatten([pool.coins.map((coin) => coin.address)])
  const tokensCountBy = countBy(tokens)

  return {
    tokenAddresses: pool.coins.map((coin) => coin.address),
    tokenAddressesAll,
    tokens,
    tokensCountBy,
    tokensAll,
    tokensLowercase,
    usdTotal: pool.usdTotal,
    pool: {
      id: pool.id,
      name: pool.name,
      address: pool.address,
      lpToken: pool.lpTokenAddress || '',
      implementation: pool.implementation,
      referenceAsset: pool.assetTypeName,
      isCrypto: poolType.includes('crypto'),
      isFactory: poolType.includes('factory'),
      gauge: pool.gaugeAddress ? {
        address: pool.gaugeAddress
      } : null
    }
  }
}

export const usePoolMapping = (chainId: ChainId): UseQueryResult<IDict<PoolDataCache>, Error> => {
  const { data, ...query } = usePoolsQuery({ chainId })
  const mapping: IDict<PoolDataFromApi> | undefined = useMemo(
    () => data && Object.fromEntries(Object.entries(data).flatMap(
        ([poolType, { poolData }]) => poolData.map((pool) => [
          pool.id,
          transformToPoolDataCache(poolType as IPoolType, pool, chainId)]
        )
      )
    ), [data, chainId]
  )
  return {
    ...query,
    ...mapping && { data: mapping }
  }
}
