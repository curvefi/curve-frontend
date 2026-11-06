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
  const wrappedSymbol = `${symbol.startsWith(symbol[0].toLowerCase()) ? 'w' : 'W'}${symbol}`
  return {
    [getAddress(address ?? ethAddress)]: { symbol, decimals: DEFAULT_DECIMALS },
    [getAddress(wrappedNativeToken)]: { symbol: wrappedSymbol, decimals: DEFAULT_DECIMALS },
  }
}
