import type { FastifyRequest } from 'fastify'
import { type Address, getAddress, zeroAddress, isAddressEqual } from 'viem'
import { zip } from '@primitives/array.utils'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { loadCurve } from '../curve-router/curvejs'
import type { TokensQuery } from './tokens.schemas'

const MIN_POOL_TVL = 100 // in dollars

/** Build the token catalog with metadata and available trading volumes from the shared Curve.js instance. */
export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>) => {
  const { curve, blacklist } = await loadCurve(request.query.chainId, request.log)
  const {
    CRVUSD_FACTORY_POOLS_DATA,
    CRYPTO_FACTORY_POOLS_DATA,
    DECIMALS: decimals,
    EXTERNAL_POOLS_DATA,
    FACTORY_POOLS_DATA,
    LLAMMAS_DATA,
    NATIVE_TOKEN: nativeToken,
    POOLS_DATA,
    STABLE_NG_FACTORY_POOLS_DATA,
    TRICRYPTO_FACTORY_POOLS_DATA,
    TWOCRYPTO_FACTORY_POOLS_DATA,
  } = curve.getNetworkConstants()

  // Match Curve's pool-data precedence once, without constructing full pool instances for metadata.
  const poolsData = {
    ...POOLS_DATA,
    ...FACTORY_POOLS_DATA,
    ...CRVUSD_FACTORY_POOLS_DATA,
    ...CRYPTO_FACTORY_POOLS_DATA,
    ...STABLE_NG_FACTORY_POOLS_DATA,
    ...TWOCRYPTO_FACTORY_POOLS_DATA,
    ...TRICRYPTO_FACTORY_POOLS_DATA,
    ...EXTERNAL_POOLS_DATA,
    ...LLAMMAS_DATA,
  }

  const pools = notFalsy(
    ...(await Promise.all(
      curve
        .getPoolList()
        .map(id => poolsData[id])
        .filter(pool => !blacklist.has(pool.swap_address.toLowerCase()))
        .map(async pool => Number(await pool.stats.totalLiquidity()) > MIN_POOL_TVL && pool),
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
    const address = getAddress(pool.lpToken)
    return (
      !isAddressEqual(address, zeroAddress) &&
      decimals[pool.lpToken] &&
      ([
        address,
        { symbol: pool.symbol, decimals: decimals[pool.lpToken], lp: true, volume: tokenVolumes[address] },
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
