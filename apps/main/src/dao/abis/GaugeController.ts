export const abi = [
  {
    name: 'add_gauge',
    outputs: [],
    inputs: [
      {
        type: 'address',
        name: 'addr',
      },
      {
        type: 'int128',
        name: 'gauge_type',
      },
      {
        type: 'uint256',
        name: 'weight',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
