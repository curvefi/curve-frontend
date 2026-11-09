import { ethAddress, getAddress } from 'viem'
import { NETWORK_CONSTANTS } from '@curvefi/api/lib/constants/network_constants.js'
import type { INetworkConstants } from '@curvefi/api/lib/interfaces'
import { getLitePoolDeployment } from '@curvefi/prices-api/pools'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'

export const getNativeTokens = async (chainId: number) => {
  const nativeToken = (NETWORK_CONSTANTS[chainId] as { NATIVE_COIN: INetworkConstants['NATIVE_TOKEN'] } | undefined)
    ?.NATIVE_COIN
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
