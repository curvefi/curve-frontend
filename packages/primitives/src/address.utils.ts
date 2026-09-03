import { maybe } from './objects.utils'

export type Hex = `0x${string}` // // Same as viem without the dependency
export type Address = Hex

export const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' satisfies Address

export const isAddress = <T extends string | null | undefined>(value: T) =>
  maybe(value, (value: string): value is Address => ADDRESS_PATTERN.test(value))

export const isAddressEqual = (a: Address, b: Address) => a.toLowerCase() === b.toLowerCase()

export type Token = {
  symbol: string
  address: Address
}
