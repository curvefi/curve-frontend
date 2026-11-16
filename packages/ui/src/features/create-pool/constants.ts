import { t } from '@ui/lib/i18n'
import { StableswapPricePreview } from './StableswapPricePreview'
import type { PoolParameter, PoolType, PoolTypeOption } from './types'

export const CREATE_POOL_SECTIONS = [
  { value: 'tokens', label: t`Tokens` },
  { value: 'pool-type', label: t`Pool type` },
  { value: 'parameters', label: t`Parameters` },
  { value: 'liquidity', label: t`Initial liquidity` },
  { value: 'name', label: t`Name and symbol` },
] as const

export type CreatePoolSection = (typeof CREATE_POOL_SECTIONS)[number]['value']

// shown before the user chose a pool type
export const EMPTY_POOL_PARAMETERS: PoolParameter[] = [
  { name: 'amplification', format: 'pool.parameter', label: t`Amplification (A)`, summaryLabel: 'A' },
  { name: 'fee', format: 'percent.value', label: t`Swap fee`, unit: '%' },
]

export const POOL_TYPES = {
  stableswap: {
    id: 'stableswap',
    label: 'Stableswap',
    description: t`Pegged assets, such as USDC/USDT. Trades near 1:1 with low slippage.`,
    defaultPreset: 'stablecoin',
    presets: [
      {
        id: 'stablecoin',
        label: t`Stablecoin`,
        values: { amplification: '1000', fee: '0.01', feeMultiplier: '10', priceOracleAveragingWindow: '866' },
      },
      {
        id: 'yield-bearing',
        label: t`Yield-bearing`,
        values: { amplification: '200', fee: '0.01', feeMultiplier: '5', priceOracleAveragingWindow: '866' },
      },
    ],
    parameters: [
      ...EMPTY_POOL_PARAMETERS,
      { name: 'feeMultiplier', advanced: true, format: 'multiplier', label: t`Offpeg fee multiplier`, unit: '×' },
      {
        name: 'priceOracleAveragingWindow',
        format: 'duration.seconds',
        label: t`Moving average time`,
        unit: 's',
        advanced: true,
      },
    ],
    CurvePreview: StableswapPricePreview,
  },
  cryptoswap: {
    id: 'cryptoswap',
    label: 'Cryptoswap',
    description: t`Assets whose prices move apart, such as BTC/USD. Liquidity re-centres on the price.`,
    // Presets, parameters and the curve preview will be added when Cryptoswap creation is supported.
    defaultPreset: '',
    presets: [],
    parameters: [],
  },
  fxswap: {
    id: 'fxswap',
    label: 'FXSwap',
    description: t`Currency pairs that drift slowly, such as EUR/USD.`,
    // Presets, parameters and the curve preview will be added when FXSwap creation is supported.
    defaultPreset: '',
    presets: [],
    parameters: [],
  },
} satisfies Record<PoolType, Omit<PoolTypeOption, 'disabled'>>
