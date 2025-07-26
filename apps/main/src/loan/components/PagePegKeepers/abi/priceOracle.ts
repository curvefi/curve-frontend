export const abi = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'price_oracle',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const abiFallback = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'price_oracle',
    inputs: [{ name: 'i', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const
