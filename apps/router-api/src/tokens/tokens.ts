import type { FastifyRequest } from 'fastify'
import { type Address, getAddress, zeroAddress, isAddressEqual } from 'viem'
import { zip } from '@primitives/array.utils'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { loadCurve } from '../curve-router/curvejs'
import type { TokensQuery } from './tokens.schemas'

const MIN_POOL_TVL = 1 // in dollars

/** Build the token catalog with metadata and available trading volumes from the shared Curve.js instance. */
export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>) => {
  const { curve, blacklist } = await loadCurve(request.query.chainId, request.log)
  const { NATIVE_TOKEN: nativeToken, DECIMALS: decimals } = curve.getNetworkConstants()

  const pools = notFalsy(
    ...(await Promise.all(
      curve
        .getPoolList()
        .map(id => curve.getPool(id))
        .filter(pool => !blacklist.has(pool.address.toLowerCase()))
        .map(async pool => Number(await pool.stats.totalLiquidity()) > MIN_POOL_TVL && pool),
    )),
  )

  const poolVolumes = curve.getIsLiteChain()
    ? undefined
    : await curve.getPoolVolumes().catch(error => {
        request.log.error({ message: 'Error fetching token volumes', error, chainId: curve.chainId })
        return undefined
      })

  const tokenVolumes = pools.reduce<Partial<Record<Address, number>>>((volumes, pool) => {
    const volume = Number(poolVolumes?.[pool.address.toLowerCase() as Address])
    if (!volume) return volumes

    const addresses = new Set(
      [...pool.underlyingCoinAddresses, ...pool.wrappedCoinAddresses].map(address => getAddress(address)),
    )

    for (const address of addresses) {
      volumes[address] = (volumes[address] ?? 0) + volume
    }

    return volumes
  }, {})

  // All tokens that are part of a pool's underlying or wrapped composition
  const poolTokens = pools.flatMap(pool =>
    [
      ...zip(
        pool.underlyingCoinAddresses.map(address => getAddress(address)),
        pool.underlyingCoins,
        pool.underlyingDecimals,
      ),
      ...zip(
        pool.wrappedCoinAddresses.map(address => getAddress(address)),
        pool.wrappedCoins,
        pool.wrappedDecimals,
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
