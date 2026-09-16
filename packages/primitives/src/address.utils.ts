export type Hex = `0x${string}` // // Same as viem without the dependency
export type Address = Hex

export type Token = { symbol: string; address: Address }

export const ADDRESS_HEX_PATTERN = /^0x[a-fA-F0-9]{40}$/
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
