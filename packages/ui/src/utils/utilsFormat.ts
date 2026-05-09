import BigNumber from 'bignumber.js'

// At the moment of writing there's a Notion ticket to remove BigNumber.js
BigNumber.config({ EXPONENTIAL_AT: 20, ROUNDING_MODE: BigNumber.ROUND_HALF_UP })
export const BN = BigNumber
