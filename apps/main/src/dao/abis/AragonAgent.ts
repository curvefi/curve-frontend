export const abi = [
  {
    constant: false,
    inputs: [
      { name: '_target', type: 'address' },
      { name: '_ethValue', type: 'uint256' },
      { name: '_data', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
