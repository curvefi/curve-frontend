export const sizes = {
  sm: '0.875rem', //14px
  md: '1.125rem', // 18px
  lg: '1.5rem', // 24px
  xl: '1.75rem', // 28px
}

export const MS = {
  '3s': 3000,
  '1m': 60000,
  '5m': 300000,
  '11m': 660000,
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const
