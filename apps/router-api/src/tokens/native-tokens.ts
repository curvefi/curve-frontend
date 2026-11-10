import { ethAddress, getAddress, zeroAddress } from 'viem'
import { CRYPTO_FACTORY_CONSTANTS } from '@curvefi/api/lib/constants/factory/crypto.js'
import { NETWORK_CONSTANTS } from '@curvefi/api/lib/constants/network_constants.js'
import type { INetworkConstants } from '@curvefi/api/lib/interfaces'
import { getLitePoolDeployment, type Pool } from '@curvefi/prices-api/pools'
import { DEFAULT_DECIMALS, maybe } from '@primitives/objects.utils'

const getNativeTokenConstants = (chainId: number) =>
  (NETWORK_CONSTANTS[chainId] as { NATIVE_COIN: INetworkConstants['NATIVE_TOKEN'] } | undefined)?.NATIVE_COIN

const isNativeImplementation = (chainId: number, implementationAddress: Pool['implementationAddress']) =>
  maybe(
    CRYPTO_FACTORY_CONSTANTS[chainId]?.tricryptoDeployImplementations?.amm_native_transfers_enabled,
    impl => impl !== zeroAddress && implementationAddress?.toLowerCase() === impl,
  )

// Curve.js exposes native aliases for legacy crypto and native-enabled tricrypto factories.
const supportsNative = (chainId: number, { poolType: type, implementationAddress }: Pool) =>
  type === 'factory_crypto' || (type === 'factory_tricrypto' && isNativeImplementation(chainId, implementationAddress))

export const getPoolNativeCoin = (chainId: number, pool: Pool) =>
  supportsNative(chainId, pool) &&
  maybe(
    getNativeTokenConstants(chainId),
    ({ address, symbol, wrappedAddress }) =>
      pool.coins.some(coin => coin.address.toLowerCase() === wrappedAddress.toLowerCase()) && {
        address: getAddress(address),
        symbol,
        decimals: DEFAULT_DECIMALS,
      },
  )

export const getNativeTokens = async (chainId: number) => {
  const nativeToken = getNativeTokenConstants(chainId)
  if (nativeToken) {
    const { address, symbol, wrappedAddress, wrappedSymbol } = nativeToken
    return {
      [getAddress(address)]: { symbol, decimals: DEFAULT_DECIMALS },
      [getAddress(wrappedAddress)]: { symbol: wrappedSymbol, decimals: DEFAULT_DECIMALS },
    }
  }

  const {
    nativeToken: address,
    nativeCurrencySymbol: symbol,
    wrappedNativeToken,
  } = await getLitePoolDeployment({ chainId })
  return {
    // ethAddress is used as native address across EVM chains. Curve.js uses the same fallback when the deployment omits native_token.
    [getAddress(address ?? ethAddress)]: { symbol, decimals: DEFAULT_DECIMALS },
    [getAddress(wrappedNativeToken)]: {
      // Match Curve.js symbol-prefix heuristic for Lite chains.
      symbol: `${symbol.startsWith(symbol[0].toLowerCase()) ? 'w' : 'W'}${symbol}`,
      decimals: DEFAULT_DECIMALS,
    },
  }
}
