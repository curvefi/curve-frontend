import { type FastifyRequest } from 'fastify'
import { type Address, getAddress, zeroAddress, isAddressEqual } from 'viem'
import { _getPoolTotalLiquidityFromApi } from '@curvefi/api/lib/cached.js'
import type { IPoolData } from '@curvefi/api/lib/interfaces'
import { zip } from '@primitives/array.utils'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { type CurveJS, loadCurve } from '../curve-router/curvejs'
import { getPoolsData } from '../curve-router/pool-data'
import type { TokensQuery } from './tokens.schemas'

const MIN_POOL_TVL = 100 // in dollars

/**
 * Read cached API TVL, constructing a pool only when an on-chain calculation is required.
 * todo: helper copied from curve-js using internal cache files, it should be exposed from there!
 **/
export const getPoolTvl = async (
  curve: CurveJS,
  { is_crypto = false, is_llamma, swap_address, id }: IPoolData & { id: string },
): Promise<number> => {
  if (curve.chainId === 1 && id === 'crveth') return 0
  if (!is_llamma) {
    const network = curve.getNetworkConstants().NETWORK_NAME
    const tvl = await _getPoolTotalLiquidityFromApi(network, id, swap_address, is_crypto, curve.getIsLiteChain())
    if (tvl !== undefined) return Number(tvl)
  }
  return Number(await curve.getPool(id).stats.totalLiquidityMemoized())
}

/** Build the token catalog with metadata and available trading volumes from the shared Curve.js instance. */
export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>) => {
  const { curve, blacklist } = await loadCurve(request.query.chainId, request.log)
  const { DECIMALS: decimals, NATIVE_TOKEN: nativeToken } = curve.getNetworkConstants()

  const pools = notFalsy(
    ...(await Promise.all(
      getPoolsData(curve)
        .filter(({ swap_address }) => !blacklist.has(swap_address.toLowerCase()))
        .map(async pool => (await getPoolTvl(curve, pool)) > MIN_POOL_TVL && pool),
    )),
  )

  const poolVolumes = curve.getIsLiteChain()
    ? undefined
    : await curve.getPoolVolumes().catch(error => {
        request.log.error({ message: 'Error fetching token volumes', error, chainId: curve.chainId })
        return undefined
      })

  const tokenVolumes = pools.reduce<Partial<Record<Address, number>>>(
    (volumes, { swap_address, underlying_coin_addresses, wrapped_coin_addresses }) => {
      const volume = Number(poolVolumes?.[swap_address.toLowerCase() as Address])
      if (!volume) return volumes

      const addresses = new Set(
        [...underlying_coin_addresses, ...wrapped_coin_addresses].map(address => getAddress(address)),
      )

      for (const address of addresses) {
        volumes[address] = (volumes[address] ?? 0) + volume
      }

      return volumes
    },
    {},
  )

  // All tokens that are part of a pool's underlying or wrapped composition
  const poolTokens = pools.flatMap(pool =>
    [
      ...zip(
        pool.underlying_coin_addresses.map(address => getAddress(address)),
        pool.underlying_coins,
        pool.underlying_decimals,
      ),
      ...zip(
        pool.wrapped_coin_addresses.map(address => getAddress(address)),
        pool.wrapped_coins,
        pool.wrapped_decimals,
      ),
    ].map(([address, symbol, decimals]) => [address, { symbol, decimals, volume: tokenVolumes[address] }] as const),
  )

  // Pool LP tokens themselves
  const lpTokens = pools.map(pool => {
    const address = getAddress(pool.token_address)
    return (
      !isAddressEqual(address, zeroAddress) &&
      decimals[pool.token_address] &&
      ([
        address,
        { symbol: pool.symbol, decimals: decimals[pool.token_address], lp: true, volume: tokenVolumes[address] },
      ] as const)
    )
  })

  const nativeAddress = getAddress(nativeToken.address)
  const nativeWrappedAddress = getAddress(nativeToken.wrappedAddress)

  // We don't need to make the list distinct by token address, we can simply overwrite previous entries with the same address, since they will have the same symbol and decimals.
  // The only difference is the volume, which is summed up anyway.
  return fromEntries(
    notFalsy(
      // Native token
      decimals[nativeToken.address] && [
        nativeAddress,
        { symbol: nativeToken.symbol, decimals: decimals[nativeToken.address], volume: tokenVolumes[nativeAddress] },
      ],
      // Native wrapped token
      decimals[nativeToken.wrappedAddress] && [
        nativeWrappedAddress,
        {
          symbol: nativeToken.wrappedSymbol,
          decimals: decimals[nativeToken.wrappedAddress],
          volume: tokenVolumes[nativeWrappedAddress],
        },
      ],
      ...poolTokens,
      ...lpTokens,
    ),
  )
}
