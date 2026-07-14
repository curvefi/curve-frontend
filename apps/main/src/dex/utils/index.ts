import { zeroAddress } from 'viem'
import type { ChainId, NetworkConfig, Token } from '@/dex/types/main.types'
import type { Address } from '@primitives/address.utils'
import type { TokenOption } from '@ui-kit/features/select-token'
import { isDexPoolListV2Enabled } from '@ui-kit/hooks/useFeatureFlags'
import { ReleaseChannel } from '@ui-kit/utils'

export { getStorageValue, setStorageValue } from '@/dex/utils/storage'

export function shortenTokenName(token: string) {
  const tokenLength = token.length
  if (tokenLength > 30) {
    return `${token.slice(0, 10)}...`
  } else {
    return token
  }
}

export const isValidAddress = (address: string) => address?.length === 42 && address !== zeroAddress

export const isHighSlippage = (slippage: number, maxSlippage: string) =>
  slippage < 0 && Math.abs(slippage) > Number(maxSlippage)

export const isBonus = (slippage: number) => Number(slippage) > 0

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
  }
}

// curve.finance url
export function getCurvefiUrl(poolId: string, host: string) {
  const v2Key = 'factory-v2-'
  const cryptoKey = 'factory-crypto-'

  if (RegExp(v2Key).exec(poolId)) {
    return `${host}/factory/${poolId.split(v2Key)[1]}`
  } else if (RegExp(cryptoKey).exec(poolId)) {
    return `${host}/factory-crypto/${poolId.split(cryptoKey)[1]}`
  } else {
    return `${host}/${poolId}`
  }
}

export const delayAction = <T extends () => unknown>(cb: T) => setTimeout(() => cb(), 50)

export const getChainPoolIdActiveKey = (chainId: ChainId | null, poolId: string | undefined) =>
  chainId && poolId ? `${chainId}-${poolId}` : ''

/**
 * Converts a Token object to a TokenOption object
 *
 * @param chain - Optional chain identifier
 * @returns A function that takes a Token and returns a TokenOption with the specified chain
 * @example
 * const tokens = tokensList.map(toTokenOption('ethereum'))
 */
export const toTokenOption =
  (chain?: string) =>
  (token: Token): TokenOption => ({
    chain,
    address: token.address as Address,
    symbol: token.symbol,
    volume: token.volume,
  })

export const isLegacyList = (releaseChannel: ReleaseChannel, network: NetworkConfig | undefined) =>
  !isDexPoolListV2Enabled(releaseChannel) || !network?.pricesApi
