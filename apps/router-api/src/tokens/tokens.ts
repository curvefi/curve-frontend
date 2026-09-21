import type { FastifyRequest } from 'fastify'
import { type Address, getAddress, zeroAddress, isAddressEqual } from 'viem'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { loadCurve } from '../curve-router/curvejs'
import type { TokensQuery } from './tokens.schemas'

/** Build the token catalog with metadata and available trading volumes from the shared Curve.js instance. */
export const getTokens = async (request: FastifyRequest<{ Querystring: TokensQuery }>) => {
  const { curve, blacklist } = await loadCurve(request.query.chainId, request.log)
  const { NATIVE_TOKEN: nativeToken, DECIMALS: decimals } = curve.getNetworkConstants()

  const pools = curve
    .getPoolList()
    .map(id => curve.getPool(id))
    .filter(pool => !blacklist.has(pool.address.toLowerCase()))

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

  const nativeAddress = getAddress(nativeToken.address)
  const nativeWrappedAddress = getAddress(nativeToken.wrappedAddress)

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
      // All pool tokens
      ...pools.flatMap(pool => [
        ...pool.underlyingCoinAddresses.map((stringAddress, index) => {
          const address = getAddress(stringAddress)
          return [
            address,
            {
              symbol: pool.underlyingCoins[index],
              decimals: pool.underlyingDecimals[index],
              volume: tokenVolumes[address],
            },
          ] as const
        }),
        ...pool.wrappedCoinAddresses.map((stringAddress, index) => {
          const address = getAddress(stringAddress)
          return [
            address,
            { symbol: pool.wrappedCoins[index], decimals: pool.wrappedDecimals[index], volume: tokenVolumes[address] },
          ] as const
        }),
      ]),
      // LP entries come last so their metadata wins when an LP token is also a pool coin.
      ...pools.map(pool => {
        const address = getAddress(pool.lpToken)
        return (
          !isAddressEqual(address, zeroAddress) &&
          decimals[pool.lpToken] &&
          ([
            address,
            { symbol: pool.symbol, decimals: decimals[pool.lpToken], lp: true, volume: tokenVolumes[address] },
          ] as const)
        )
      }),
    ),
  )
}
