export const abi = [
  {
    stateMutability: 'view',
    type: 'function',
    name: 'debt_ceiling',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
] as const
