import { formatUnits } from 'viem'
import { decimal } from '@ui/lib/decimal'

export * from './address'
export * from './web3'
export * from './network'
export * from './pagination'
export * from './average-categories'
export * from './rates'
export * from '@ui/lib/tokens' // todo: update imports and remove this in a separate PR

export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
