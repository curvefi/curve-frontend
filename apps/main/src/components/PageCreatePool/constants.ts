import type { ImplementationId } from '@/components/PageCreatePool/types'
import BigNumber from 'bignumber.js'

import { NATIVE_TOKENS } from '@curvefi/api/lib/curve'
import { t } from '@lingui/macro'

export const CRYPTOSWAP = 'Cryptoswap'
export const STABLESWAP = 'Stableswap'
export const TOKEN_A = 'tokenA'
export const TOKEN_B = 'tokenB'
export const TOKEN_C = 'tokenC'
export const TOKEN_D = 'tokenD'
export const TOKEN_E = 'tokenE'
export const TOKEN_F = 'tokenF'
export const TOKEN_G = 'tokenG'
export const TOKEN_H = 'tokenH'

export type PRESETS = {
  [index: number]: {
    name: string
    descriptionName: string
    description: string
    defaultParams: {
      stableSwapFee: string
      stableA: string
      maExpTime: string
      offpegFeeMultiplier: string
      midFee: string
      outFee: string
      cryptoA: string
      gamma: string
      allowedExtraProfit: string
      feeGamma: string
      adjustmentStep: string
      maHalfTime: string
    }
  }
}

interface ImplementationDetail {
  name: string
  descriptionName: string
  titleDescription: string
  description: string
}

const fillerParams = {
  stableSwapFee: '',
  stableA: '',
  maExpTime: '',
  offpegFeeMultiplier: '',
  midFee: '',
  outFee: '',
  cryptoA: '',
  gamma: '',
  allowedExtraProfit: '',
  feeGamma: '',
  adjustmentStep: '',
  maHalfTime: '',
}

export const POOL_PRESETS: PRESETS = {
  // stableswap
  0: {
    name: 'Fiat Redeemable Stablecoins',
    descriptionName: t`Fiat Redeemable Stablecoins`,
    description: t`Suitable for stablecoins that are fiat-redeemable`,
    defaultParams: {
      ...fillerParams,
      stableSwapFee: '0.01',
      stableA: '1000',
      maExpTime: '600',
      offpegFeeMultiplier: '2',
    },
  },
  1: {
    name: 'Crypto Collateralized Stablecoins',
    descriptionName: t`Crypto Collateralized Stablecoins`,
    description: t`Suitable for stablecoins that are crypto-backed`,
    defaultParams: {
      ...fillerParams,
      stableSwapFee: '0.04',
      stableA: '100',
      maExpTime: '600',
      offpegFeeMultiplier: '2',
    },
  },
  2: {
    name: 'Liquid Restaking Tokens',
    descriptionName: t`Liquid Restaking Tokens`,
    description: t`Suitable for LRTs`,
    defaultParams: {
      ...fillerParams,
      stableSwapFee: '0.01',
      stableA: '500',
      maExpTime: '600',
      offpegFeeMultiplier: '5',
    },
  },
  // cryptoswap
  3: {
    name: 'Crypto',
    descriptionName: t`Crypto`,
    description: t`Suitable for most volatile pairs such as LDO <> ETH`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.26',
      outFee: '0.45',
      cryptoA: '400000',
      gamma: '0.000145',
      allowedExtraProfit: '0.000002',
      feeGamma: '0.00023',
      adjustmentStep: '0.000146',
      maHalfTime: '600',
    },
  },
  4: {
    name: 'Forex',
    descriptionName: t`Forex`,
    description: t`Suitable for forex pairs with low relative volatility`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.05',
      outFee: '0.45',
      cryptoA: '20000000',
      gamma: '0.001',
      allowedExtraProfit: '0.00000001',
      feeGamma: '0.005',
      adjustmentStep: '0.0000055',
      maHalfTime: '600',
    },
  },
  5: {
    name: 'Liquid Staking Derivatives',
    descriptionName: t`Liquid Staking Derivatives`,
    description: t`Suitable for liquid staking derivatives soft-pegged to its underlying asset.`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.03',
      outFee: '0.45',
      cryptoA: '40000000',
      gamma: '0.002',
      allowedExtraProfit: '0.00000001',
      feeGamma: '0.3',
      adjustmentStep: '0.0000055',
      maHalfTime: '600',
    },
  },
  6: {
    name: 'Liquid Restaking Tokens',
    descriptionName: t`Liquid Restaking Tokens`,
    description: t`Suitable for LRTs`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.005',
      outFee: '0.08',
      cryptoA: '20000000',
      gamma: '0.02',
      allowedExtraProfit: '0.00000001',
      feeGamma: '0.03',
      adjustmentStep: '0.0000055',
      maHalfTime: '600',
    },
  },
  // tricrypto
  7: {
    name: 'Tricrypto',
    descriptionName: t`Tricrypto`,
    description: t`Suitable for USD stablecoin <> BTC stablecoin <> ETH.`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.01',
      outFee: '1.4',
      cryptoA: '540000',
      gamma: '0.0000805',
      allowedExtraProfit: '0.0000000001',
      feeGamma: '0.0004',
      adjustmentStep: '0.0000001',
      maHalfTime: '600',
    },
  },
  8: {
    name: 'Three Coin Volatile',
    descriptionName: t`Three Coin Volatile`,
    description: t`Suitable for volatile tokens paired against ETH and USD stablecoins`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.02999999',
      outFee: '0.8',
      cryptoA: '2700000',
      gamma: '0.0000013',
      allowedExtraProfit: '0.0000001',
      feeGamma: '0.00035',
      adjustmentStep: '0.0000001',
      maHalfTime: '600',
    },
  },
}

export const IMPLEMENTATION_IDS = (chainId: ChainId): { [K in ImplementationId]: ImplementationDetail } => {
  return {
    0: {
      name: 'Basic',
      descriptionName: t`Basic`,
      titleDescription: '',
      description: t`For pools that supports any major ERC20 return implementation (”return True / revert”, “return None / revert”, “return True / return False”), and any number of decimal places up to 18`,
    },
    1: {
      name: 'Balances',
      descriptionName: t`Balances`,
      titleDescription: '',
      description: t`For pools with rebase tokens like aTokens, or where there's a fee-on-transfer.`,
    },
    2: {
      name: `${NATIVE_TOKENS[chainId].symbol} (currently not available)`,
      descriptionName: t`${NATIVE_TOKENS[chainId].symbol}`,
      titleDescription: t`(only available for pools with pegged assets)`,
      description: t`For pools containing native ${NATIVE_TOKENS[chainId].symbol} (represented as 0xEE…EE)`,
    },
    3: {
      name: 'Optimised',
      descriptionName: t`Optimised`,
      titleDescription: t`(only available for pools with pegged assets)`,
      description: t`A more gas-efficient implementation that can be used when every token in the pool has 18 decimals and returns True on success / reverts on error`,
    },
  }
}

export const DEFAULT_INITIAL_PRICE = {
  min: 0.000000000001,
  max: 1000000000000,
}

// MIN-MAX PARAMS

export const STABLESWAP_MIN_MAX_PARAMETERS = (swapFee: number) => {
  return {
    swapFee: {
      min: 0,
      max: 1,
    },
    a: {
      min: 1,
      max: 5000,
    },
    maExpTime: {
      min: 60,
      max: 3600,
    },
    offpegFeeMultiplier: {
      min: 0,
      max:
        swapFee === 0
          ? 0
          : new BigNumber(5)
              .multipliedBy(new BigNumber(10).pow(19))
              .dividedBy(new BigNumber(swapFee).multipliedBy(new BigNumber(10).pow(10)))
              .dividedBy(new BigNumber(10).pow(10))
              .toNumber(), // (5 * 10 ** 19) / (swapFee * 10 ** 10) / 10 ** 10
    },
    initialPrice: {
      min: 0.000000000001,
      max: 1000000000000,
    },
  }
}

export const TRICRYPTO_MIN_MAX_PARAMETERS = {
  midFee: {
    min: 0.005,
    max: 3,
  },
  outFee: {
    // min: midFee
    max: 3,
  },
  a: {
    min: (2 ** 2 * 10000) / 10,
    max: 2 ** 2 * 1000 * 100000,
  },
  gamma: {
    min: 10 ** 10 / 1e18,
    max: (5 * 10 ** 16) / 1e18,
  },
  allowedExtraProfit: {
    min: 0,
    max: 0.01,
  },
  feeGamma: {
    min: 0,
    max: 1,
  },
  adjustmentStep: {
    min: 0,
    max: 1,
  },
  maHalfTime: {
    min: 60,
    max: 7 * 86400,
  },
}

export const TWOCRYPTO_MIN_MAX_PARAMETERS = {
  midFee: {
    min: 0.005,
    max: 3,
  },
  outFee: {
    // min: midFee
    max: 3,
  },
  a: {
    min: (2 ** 2 * 10000) / 10,
    max: 2 ** 2 * 1000 * 10000,
  },
  gamma: {
    min: 10 ** 10 / 1e18,
    max: (199 * 10 ** 15) / 1e18,
  },
  allowedExtraProfit: {
    min: 0,
    max: 0.01,
  },
  feeGamma: {
    min: 0,
    max: 1,
  },
  adjustmentStep: {
    min: 0,
    max: 1,
  },
  maHalfTime: {
    min: 60,
    max: 7 * 86400,
  },
}
