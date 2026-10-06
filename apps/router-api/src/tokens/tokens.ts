import type { FastifyRequest } from 'fastify'
import { type Address, getAddress, zeroAddress, isAddressEqual } from 'viem'
import { fromEntries, notFalsy } from '@primitives/objects.utils'
import { loadCurve } from '../curve-router/curvejs'
import type { TokensQuery } from './tokens.schemas'

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

  const pools = curve
    .getPoolList()
    .map(id => poolsData[id])
    .filter(pool => !blacklist.has(pool.swap_address.toLowerCase()))

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
      ...pools.flatMap(
        ({
          underlying_coin_addresses,
          underlying_coins,
          underlying_decimals,
          wrapped_coin_addresses,
          wrapped_coins,
          wrapped_decimals,
        }) => [
          ...underlying_coin_addresses.map((stringAddress, index) => {
            const address = getAddress(stringAddress)
            return [
              address,
              { symbol: underlying_coins[index], decimals: underlying_decimals[index], volume: tokenVolumes[address] },
            ] as const
          }),
          ...wrapped_coin_addresses.map((stringAddress, index) => {
            const address = getAddress(stringAddress)
            return [
              address,
              { symbol: wrapped_coins[index], decimals: wrapped_decimals[index], volume: tokenVolumes[address] },
            ] as const
          }),
        ],
      ),
      // LP entries come last so their metadata wins when an LP token is also a pool coin.
      ...pools.map(pool => {
        const address = getAddress(pool.token_address)
        return (
          !isAddressEqual(address, zeroAddress) &&
          decimals[pool.token_address] &&
          ([
            address,
            { symbol: pool.symbol, decimals: decimals[pool.token_address], lp: true, volume: tokenVolumes[address] },
          ] as const)
        )
      }),
    ),
  )
}
