import { fromDate } from '@curvefi/prices-api/timestamp'
import { ActivityStoryProviders, ActivityStoryTable } from '@evm-ui/features/activity-table/ActivityTable.stories'
import type { Address, Token } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ } from '@ui/features/queries/util'
import type { PoolLiquidityRow, PoolSwapRow } from './types'
import { toPoolActivityLiquidityRow, toPoolActivitySwapRow } from './utils'

const generateAddress = (seed: number): Address => `0x${seed.toString(16).padStart(40, '0')}`
const generateTxHash = (seed: number): Address => `0x${seed.toString(16).padStart(64, '0')}`

// DEX Pool Mock Tokens (TriCrypto - USDT/WBTC/WETH)
const USDT_TOKEN = {
  symbol: 'USDT',
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as Address,
  poolIndex: 0,
  eventIndex: 0,
}

const WBTC_TOKEN = {
  symbol: 'WBTC',
  address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as Address,
  poolIndex: 1,
  eventIndex: 1,
}

const WETH_TOKEN = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
  poolIndex: 2,
  eventIndex: 2,
}

// Pool Trades Mock Data Generator
const generatePoolTrades = (count: number): PoolSwapRow[] => {
  const tokens = [USDT_TOKEN, WBTC_TOKEN, WETH_TOKEN]
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const soldIndex = i % 3
    const boughtIndex = (i + 1) % 3
    const tokenSold = tokens[soldIndex]
    const tokenBought = tokens[boughtIndex]

    const tokensSold = Math.random() * 10000 + 100
    const tokensBought = Math.random() * 5 + 0.1
    const price = tokensSold / tokensBought
    const soldUsd = tokensSold * (soldIndex === 0 ? 1 : soldIndex === 1 ? 42000 : 2600)

    return {
      soldId: soldIndex,
      boughtId: boughtIndex,
      tokensSold,
      tokensSoldUsd: i === 3 ? 0 : i === 1 || i === 2 ? null : soldUsd,
      tokensBought,
      tokensBoughtUsd: i === 2 ? null : tokensBought * (boughtIndex === 0 ? 1 : boughtIndex === 1 ? 42000 : 2600),
      price,
      blockNumber: 19000000 + i * 100,
      time: fromDate(new Date(now - i * 3600000)), // 1 hour apart
      txHash: generateTxHash(1000 + i),
      buyer: generateAddress(2000 + i),
      fee: Math.random() * 0.01,
      usdFee: Math.random() * 10,
      tokenSold,
      tokenBought,
      poolState: null,
      blockchainId: 'ethereum',
      chainId: Chain.Ethereum,
    }
  })
}

// Pool tokens for liquidity events
const POOL_TOKENS: Token[] = [
  { symbol: 'USDT', address: USDT_TOKEN.address },
  { symbol: 'WBTC', address: WBTC_TOKEN.address },
  { symbol: 'WETH', address: WETH_TOKEN.address },
]

// Pool Liquidity Mock Data Generator
const generatePoolLiquidity = (count: number): PoolLiquidityRow[] => {
  const events = [
    { eventType: 'AddLiquidity', tokenAmounts: [10000, 0.5, 2] },
    { eventType: 'RemoveLiquidity', tokenAmounts: [2500, 0.1, 0.5] },
    { eventType: 'RemoveLiquidityOne', tokenAmounts: [0, 0, 1.5] },
    { eventType: 'RemoveLiquidityImbalance', tokenAmounts: [1000, 0, 0.25] },
    { eventType: 'AddLiquidity', tokenAmounts: [0, 0.25, 0] },
  ] satisfies Pick<PoolLiquidityRow, 'eventType' | 'tokenAmounts'>[]
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => ({
    ...events[i % events.length],
    fees: [Math.random() * 10, Math.random() * 0.001, Math.random() * 0.01],
    tokenSupply: 1000000 + Math.random() * 500000,
    blockNumber: 19000000 + i * 50,
    time: fromDate(new Date(now - i * 7200000)), // 2 hours apart
    txHash: generateTxHash(3000 + i),
    provider: generateAddress(4000 + i),
    blockchainId: 'ethereum',
    chainId: Chain.Ethereum,
    poolTokens: POOL_TOKENS,
  }))
}

const swapsQuery = constQ(generatePoolTrades(20).map(toPoolActivitySwapRow))
const liquidityQuery = constQ(generatePoolLiquidity(15).map(toPoolActivityLiquidityRow))

const meta: Meta = {
  title: 'DEX/Features/PoolActivity',
  decorators: [
    Story => (
      <ActivityStoryProviders>
        <Story />
      </ActivityStoryProviders>
    ),
  ],
  parameters: { layout: 'padded' },
}

export default meta

/**
 * DEX Pool Activity table showing swap and liquidity events.
 * Based on TriCrypto pool: 0x4eBdF703948ddCEA3B11f675B4D1Fba9d2414A14
 */
export const DexPoolActivity: StoryObj<typeof meta> = {
  render: () => (
    <>
      <ActivityStoryTable
        query={swapsQuery}
        emptyTitle="No trades data found."
        errorTitle="Could not load trades data."
      />
      <ActivityStoryTable
        query={liquidityQuery}
        hasValue={false}
        emptyTitle="No liquidity data found."
        errorTitle="Could not load liquidity data."
      />
    </>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Swap and liquidity activity using mock data based on the TriCrypto pool (USDT/WBTC/WETH).',
      },
    },
  },
}
