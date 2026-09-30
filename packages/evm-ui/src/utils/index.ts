import { formatUnits } from 'viem'
import { decimal } from '@ui/lib/decimal'

export * from './address'
export * from './web3'
export * from './network'
export * from './pagination'
export * from './average-categories'

export const fromWei = (n: string, decimals: number) => decimal(formatUnits(BigInt(n), decimals))!
