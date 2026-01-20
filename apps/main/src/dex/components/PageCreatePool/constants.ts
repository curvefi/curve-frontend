import BigNumber from 'bignumber.js'
import { t } from '@ui-kit/lib/i18n'
import type { NgAssetType } from './types'

export const CRYPTOSWAP = 'Cryptoswap'
export const STABLESWAP = 'Stableswap'
export const FXSWAP = 'FXSwap'
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

export const ORACLE_DECIMALS = 18

export const NG_ASSET_TYPE: Record<string, NgAssetType> = {
  STANDARD: 0,
  ORACLE: 1,
  REBASING: 2,
  ERC4626: 3,
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
      offpegFeeMultiplier: '10',
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
      offpegFeeMultiplier: '20',
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
      offpegFeeMultiplier: '10',
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
    name: 'Low volatility',
    descriptionName: t`Low volatility`,
    description: t`Suitable for pairs with low relative volatility`,
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
  // fxswap
  9: {
    name: 'FXSwap',
    descriptionName: t`FXSwap`,
    description: t`Suitable for forex tokens with low volatility`,
    defaultParams: {
      ...fillerParams,
      midFee: '0.25', // 25/10_000 * 10**10 (25 bps)
      outFee: '0.50', // 50/10_000 * 10**10 (50 bps)
      cryptoA: '100000', // 10 * 10000
      gamma: '0.0001', // 10**14 (irrelevant for fx pools)
      allowedExtraProfit: '0.000000000001', // 1e-12 * 10**18
      feeGamma: '0.001', // 0.001 * 1e18
      adjustmentStep: '0.005', // 0.5/100*10**18
      maHalfTime: '600', // 866 * 0.693 (half life in seconds)
    },
  },
}

// MIN-MAX PARAMS

export const STABLESWAP_MIN_MAX_PARAMETERS = (swapFee: number) => ({
  swapFee: {
    min: 0,
    max: 1,
  },
  a: {
    min: 1,
    max: 20000,
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
})

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
