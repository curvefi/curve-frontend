import useStore from '@/store/useStore'
import type { QueryFunction } from '@tanstack/react-query'

import { PoolMethodResult, PoolQueryKeyType } from '@/entities/pool'
import { assertPoolsValidity, assertPoolValidity } from '@/entities/pool/lib/validation'
import networks from '@/networks'

export function getPool(id: string) {
  const { curve } = useStore.getState()
  try {
    return curve.getPool(id)
  } catch (error) {
    debugger
    throw error
  }
}

export const queryLiquidity: QueryFunction<
  PoolMethodResult<'stats.totalLiquidity'>,
  PoolQueryKeyType<'liquidity'>
> = async ({ queryKey }) => {
  // logQuery(queryKey)
  const [, chainId, poolId ] = queryKey
  const _valid = assertPoolValidity({ chainId, poolId })
  return await getPool(_valid.poolId).stats.totalLiquidity()
}

export const queryVolume: QueryFunction<
  PoolMethodResult<'stats.volume'>,
  PoolQueryKeyType<'volume'>
> = async ({ queryKey }) => {
  // logQuery(queryKey)
  const [, chainId, poolId ] = queryKey
  const _valid = assertPoolValidity({ chainId, poolId })
  return await getPool(_valid.poolId).stats.volume()
}

export const queryPoolMapping: QueryFunction<
  Record<string, PoolData>,
  PoolQueryKeyType<'root'>
  > = async ({ queryKey }) => {
  const [, inChainId, , ] = queryKey
  const { curve, poolList, pools } = useStore.getState()
  const {chainId} = assertPoolsValidity( { chainId: inChainId } )

  // get poolList
  const poolIds = await networks[chainId].api.network.fetchAllPoolsList(curve)

  // default hideSmallPools to false if poolIds length < 10
  poolList.setStateByKey('formValues', { ...poolList.formValues, hideSmallPools: poolIds.length > 10 })

  // TODO: Temporary code to determine if there is an issue with getting base APY from  Kava Api (https://api.curve.fi/api/getFactoryAPYs-kava)
  const failedFetching24hOldVprice: { [poolAddress: string]: boolean } =
    chainId === 2222 ? await networks[chainId].api.network.getFailedFetching24hOldVprice() : {}

  const poolMapping = await pools.fetchPools(
    curve,
    poolIds.filter((poolId) => !networks[chainId].customPoolIds[poolId]),
    failedFetching24hOldVprice
  )

  // todo: remove this check, inline fetchPools and raise the real error
  if (!poolMapping) throw new Error('Unable to load pool list, please refresh or try again later.')
  return poolMapping

  // todo: code below used to be in createPoolsSlice
  // if (!prevCurveApi || isNetworkSwitched) {
  //   get().gas.fetchGasInfo(curveApi)
  //   get().updateGlobalStoreByKey('isLoadingApi', false)
  //   get().pools.fetchPricesApiPools(chainId)
  //   get().pools.fetchBasePools(curveApi)
  //
  //   // pull all api calls before isLoadingApi if it is not needed for initial load
  //   get().usdRates.fetchAllStoredUsdRates(curveApi)
  //   get().pools.fetchTotalVolumeAndTvl(curveApi)
  // } else {
  //   get().updateGlobalStoreByKey('isLoadingApi', false)
  // }
  //
  // if (curveApi.signerAddress) {
  //   get().user.fetchUserPoolList(curveApi)
  // }
}
