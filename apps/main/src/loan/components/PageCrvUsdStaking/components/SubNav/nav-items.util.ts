export const SUB_NAV_ITEMS = [
  { key: 'deposit', label: 'Deposit' },
  { key: 'withdraw', label: 'Withdraw' },
  { key: 'swap', label: 'Swap' },
] as const

export type SubNavItem = (typeof SUB_NAV_ITEMS)[number]
