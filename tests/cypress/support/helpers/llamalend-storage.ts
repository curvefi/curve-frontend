export const LLAMA_FILTERS_V1 = [
  { id: 'tvl', value: [10000, null] },
  { id: 'liquidityUsd', value: [null, null] },
  { id: 'type', value: [] },
]

export const LLAMA_VISIBILITY_SETTINGS_V0 = {
  hasPositions: [
    {
      label: 'Markets',
      options: [
        {
          label: 'Available Liquidity',
          columns: ['liquidityUsd'],
          active: true,
          enabled: true,
        },
        {
          label: 'Utilization',
          columns: ['utilizationPercent'],
          active: true,
          enabled: true,
        },
        {
          label: 'Chart',
          columns: ['borrowChart'],
          active: false,
          enabled: true,
        },
      ],
    },
    {
      label: 'Borrow',
      options: [
        {
          label: 'Borrow Details',
          columns: ['userHealth', 'userBorrowed'],
          active: true,
          enabled: true,
        },
      ],
    },
    {
      label: 'Lend',
      options: [
        {
          label: 'Lend Details',
          columns: ['userEarnings', 'userDeposited'],
          active: true,
          enabled: true,
        },
      ],
    },
  ],
  noPositions: [
    {
      label: 'Markets',
      options: [
        {
          label: 'Available Liquidity',
          columns: ['liquidityUsd'],
          active: true,
          enabled: true,
        },
        {
          label: 'Utilization',
          columns: ['utilizationPercent'],
          active: true,
          enabled: true,
        },
        {
          label: 'Chart',
          columns: ['borrowChart'],
          active: true,
          enabled: true,
        },
      ],
    },
    {
      label: 'Borrow',
      options: [
        {
          label: 'Borrow Details',
          columns: ['userHealth', 'userBorrowed'],
          active: true,
          enabled: false,
        },
      ],
    },
    {
      label: 'Lend',
      options: [
        {
          label: 'Lend Details',
          columns: ['userEarnings', 'userDeposited'],
          active: true,
          enabled: false,
        },
      ],
    },
  ],
  unknown: [],
}
