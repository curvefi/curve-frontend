import { formatUnits, getAddress, isAddress } from 'viem'
import { decimal } from '@ui/lib/decimal'

export * from './address'
export * from './web3'
export * from './network'
export * from './pagination'
export * from './average-categories'
export * from './rates'
export * from './tokens'

export function tryChecksumAddress(text: string) {
  if (isAddress(text)) {
    try {
      return getAddress(text)
    } catch (error) {
      console.warn('Failed to checksum address', error)
    }
  }
  return text
}

export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
