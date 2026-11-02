import { t } from '@ui/lib/i18n'
import { StableswapLiquidityDepthPreview } from './StableswapLiquidityDepthPreview'
import type { PoolType } from './types'

export const CREATE_POOL_SECTIONS = [
  { value: 'tokens', label: t`Tokens` },
  { value: 'pool-type', label: t`Pool type` },
  { value: 'parameters', label: t`Parameters` },
  { value: 'liquidity', label: t`Initial liquidity` },
  { value: 'name', label: t`Name and symbol` },
] as const

// Temporary grid layout while the mobile design is being refined.
export const CREATE_POOL_COLUMNS = {
  display: 'grid',
  gridTemplateColumns: { mobile: 'minmax(0, 1fr)', tablet: 'repeat(2, minmax(0, 1fr))' },
} as const

export const POOL_TYPES = {
  stableswap: {
    id: 'stableswap',
    slippageType: 'stable',
    label: 'Stableswap',
    description: t`Pegged assets. Trades near 1:1 with low slippage, such as USDC/USDT.`,
    liquidityDescription: t`Optional for Stableswap. The first deposit must fund every token; the pool trades around a 1:1 peg.`,
    defaultPreset: 'fiat',
    presets: [
      {
        id: 'fiat',
        label: t`Fiat-backed`,
        values: { amplification: '1000', fee: '0.01', feeMultiplier: '10', priceOracleAveragingWindow: '866' },
      },
      {
        id: 'crypto',
        label: t`Crypto-backed`,
        values: { amplification: '100', fee: '0.04', feeMultiplier: '20', priceOracleAveragingWindow: '866' },
      },
    ],
    parameters: [
      {
        name: 'amplification',
        format: 'pool.parameter',
        label: t`Amplification (A)`,
        helperText: t`Higher values concentrate liquidity closer to the peg.`,
      },
      {
        name: 'fee',
        format: 'percent.value',
        label: t`Swap fee`,
        unit: '%',
        helperText: t`Charged when the pool is balanced.`,
      },
      {
        name: 'feeMultiplier',
        format: 'multiplier',
        label: t`Dynamic fee multiplier`,
        unit: '×',
        helperText: t`Increases the fee as the pool becomes imbalanced.`,
      },
      {
        name: 'priceOracleAveragingWindow',
        format: 'pool.parameter',
        label: t`Price oracle averaging window`,
        unit: t`seconds`,
        advanced: true,
      },
    ],
    LiquidityDepthPreview: StableswapLiquidityDepthPreview,
  },
  cryptoswap: {
    id: 'cryptoswap',
    label: 'Cryptoswap',
    description: t`Assets whose prices move apart, such as BTC/USD. Liquidity automatically re-centres on the price.`,
    slippageType: 'crypto',
    // Presets, parameters and the curve preview will be added when Cryptoswap creation is supported.
    liquidityDescription: '',
    defaultPreset: '',
    presets: [],
    parameters: [],
  },
  fxswap: {
    id: 'fxswap',
    label: 'FXSwap',
    description: t`Currency pairs that drift slowly, such as EUR/USD.`,
    slippageType: 'stable',
    // Presets, parameters and the curve preview will be added when FXSwap creation is supported.
    liquidityDescription: '',
    defaultPreset: '',
    presets: [],
    parameters: [],
  },
} satisfies Record<string, PoolType>
