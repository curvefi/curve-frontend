import { zeroAddress } from 'viem'
import type { ChainId } from '@/dex/types/main.types'

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

export const delayAction = <T extends () => unknown>(cb: T) => setTimeout(() => cb(), 50)

export const getChainPoolIdActiveKey = (chainId: ChainId | null, poolId: string | undefined) =>
  chainId && poolId ? `${chainId}-${poolId}` : ''
