export type Hex = `0x${string}` // // Same as viem without the dependency
export type Address = Hex

export type Token = {
  symbol: string
  address: Address
}
