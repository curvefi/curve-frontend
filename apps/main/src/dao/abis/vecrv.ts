export const ABI_VECRV = [
  {
    name: 'balanceOfAt',
    outputs: [{ type: 'uint256', name: '' }],
    inputs: [
      { type: 'address', name: 'addr' },
      { type: 'uint256', name: '_block' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: 'supply', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'supply',
    outputs: [{ internalType: 'uint256', name: 'supply', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
