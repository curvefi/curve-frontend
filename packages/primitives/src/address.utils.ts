export type Hex = `0x${string}` // // Same as viem without the dependency
export type Address = Hex

export interface Token {
  symbol: string
  address: Address
}
