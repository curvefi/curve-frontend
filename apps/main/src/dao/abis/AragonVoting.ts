export const abi = [
  {
    constant: false,
    inputs: [
      { name: '_executionScript', type: 'bytes' },
      { name: '_metadata', type: 'string' },
      { name: '_castVote', type: 'bool' },
      { name: '_executesIfDecided', type: 'bool' },
    ],
    name: 'newVote',
    outputs: [{ name: 'voteId', type: 'uint256' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
