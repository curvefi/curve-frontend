export * from './address'
export * from './BigDecimal'
export * from './bigNumber'
export * from './web3'
export * from './network'
export * from './number'
export * from './searchText'

export const isBeta =
  typeof window !== 'undefined' &&
  (window.localStorage.getItem('beta') !== null || !window.location.hostname.includes('curve.fi'))
