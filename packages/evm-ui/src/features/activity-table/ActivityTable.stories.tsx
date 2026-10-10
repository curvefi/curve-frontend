import { useMemo } from 'react'
import { WagmiProvider } from 'wagmi'
import { fromDate } from '@curvefi/prices-api/timestamp'
import {
  LLAMMA_EVENTS_BREAKDOWN,
  LLAMMA_EVENTS_COLUMNS,
} from '@evm-ui/features/activity-table/columns/llamma-events-columns'
import { LLAMMA_TRADES_COLUMNS } from '@evm-ui/features/activity-table/columns/llamma-trades-columns'
import { createPoolLiquidityColumns } from '@evm-ui/features/activity-table/columns/pool-liquidity-columns'
import { POOL_TRADES_COLUMNS } from '@evm-ui/features/activity-table/columns/pool-trades-columns'
import { MarketEventsExpandedPanel } from '@evm-ui/features/activity-table/panels/MarketEventsExpandedPanel'
import { MarketTradesExpandedPanel } from '@evm-ui/features/activity-table/panels/MarketTradesExpandedPanel'
import { PoolLiquidityExpandedPanel } from '@evm-ui/features/activity-table/panels/PoolLiquidityExpandedPanel'
import { PoolTradesExpandedPanel } from '@evm-ui/features/activity-table/panels/PoolTradesExpandedPanel'
import { createTestWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-test-config'
import Stack from '@mui/material/Stack'
import type { Address, Token } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, fakeLoadingQ, q } from '@ui/features/queries/util'
import { useCurveTable } from '@ui/features/tables/data-table.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ActivityTable } from './ActivityTable'
import type { MarketEventRow, MarketTradeRow, PoolLiquidityRow, PoolTradeRow } from './types'

const { Spacing } = SizesAndSpaces

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

// Lending Mock Tokens (WETH/crvUSD market)
const COLLATERAL_TOKEN: Token = { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }

const BORROW_TOKEN: Token = { symbol: 'crvUSD', address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' }

// Pool Trades Mock Data Generator
const generatePoolTrades = (count: number): PoolTradeRow[] => {
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

    return {
      soldId: soldIndex,
      boughtId: boughtIndex,
      tokensSold,
      tokensSoldUsd: tokensSold * (soldIndex === 0 ? 1 : soldIndex === 1 ? 42000 : 2600),
      tokensBought,
      tokensBoughtUsd: tokensBought * (boughtIndex === 0 ? 1 : boughtIndex === 1 ? 42000 : 2600),
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
  const eventTypes = ['AddLiquidity', 'RemoveLiquidity', 'RemoveLiquidityOne', 'RemoveLiquidityImbalance'] as const
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => ({
    eventType: eventTypes[i % eventTypes.length],
    tokenAmounts: [Math.random() * 10000, Math.random() * 0.5, Math.random() * 2],
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

// Llamma Trades Mock Data Generator
const generateLlammaTrades = (count: number, collateralToken: Token, borrowToken: Token): MarketTradeRow[] => {
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const isBuy = i % 2 === 0
    const amountSold = Math.random() * 5 + 0.1
    const amountBought = Math.random() * 10000 + 500

    return {
      idSold: isBuy ? 1 : 0,
      idBought: isBuy ? 0 : 1,
      tokenSold: isBuy ? borrowToken : collateralToken,
      tokenBought: isBuy ? collateralToken : borrowToken,
      amountSold: isBuy ? amountBought : amountSold,
      amountBought: isBuy ? amountSold : amountBought,
      price: amountBought / amountSold,
      buyer: generateAddress(5000 + i),
      feeX: Math.random() * 0.001,
      feeY: Math.random() * 10,
      blockNumber: 19000000 + i * 75,
      timestamp: fromDate(new Date(now - i * 1800000)), // 30 minutes apart
      txHash: generateTxHash(5000 + i),
      blockchainId: 'ethereum',
      chainId: Chain.Ethereum,
    }
  })
}

// Llamma Events Mock Data Generator
const generateLlammaEvents = (count: number, collateralToken: Token, borrowToken: Token): MarketEventRow[] => {
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const isDeposit = i % 3 !== 2 // 2/3 deposits, 1/3 withdrawals
    const isSoftLiquidated = i % 2 === 0 // half of the withdrawals return both collateral and borrowed tokens

    const event = {
      provider: generateAddress(6000 + i),
      blockNumber: 19000000 + i * 60,
      timestamp: fromDate(new Date(now - i * 3600000)), // 1 hour apart
      txHash: generateTxHash(6000 + i),
      blockchainId: 'ethereum',
      chainId: Chain.Ethereum,
      collateralToken,
      borrowToken,
    } as const

    return isDeposit
      ? {
          ...event,
          type: 'deposit',
          deposit: {
            amount: Math.random() * 10 + 0.5,
            amountUsd: 2500,
            n1: Math.floor(Math.random() * 50),
            n2: Math.floor(Math.random() * 50) + 50,
          },
          withdrawal: null,
        }
      : {
          ...event,
          type: 'withdrawal',
          deposit: null,
          withdrawal: {
            amountBorrowed: isSoftLiquidated ? Math.random() * 5000 + 100 : 0,
            amountBorrowedUsd: isSoftLiquidated ? 1000 : 0,
            amountCollateral: Math.random() * 2 + 0.1,
            amountCollateralUsd: 3000,
          },
        }
  })
}

const liquidityColumns = createPoolLiquidityColumns({ blockchainId: 'ethereum', poolTokens: POOL_TOKENS })
const wagmiConfig = createTestWagmiConfig()

/**
 * DEX Pool Activity Component
 * Pool: TriCrypto (0x4eBdF703948ddCEA3B11f675B4D1Fba9d2414A14)
 */
const DexPoolActivityComponent = () => {
  const tradesData = useMemo(() => generatePoolTrades(20), [])
  const liquidityData = useMemo(() => generatePoolLiquidity(15), [])

  const tradesTable = useCurveTable({ query: constQ(tradesData), columns: POOL_TRADES_COLUMNS })

  const liquidityTable = useCurveTable({ query: constQ(liquidityData), columns: liquidityColumns })

  return (
    <>
      <ActivityTable
        table={tradesTable}
        emptyState={{ title: 'No trades data found.' }}
        errorState={{ title: 'Could not load trades data.' }}
        expandedPanel={{ Body: PoolTradesExpandedPanel }}
      />
      <ActivityTable
        table={liquidityTable}
        emptyState={{ title: 'No liquidity data found.' }}
        errorState={{ title: 'Could not load liquidity data.' }}
        expandedPanel={{ Body: PoolLiquidityExpandedPanel }}
      />
    </>
  )
}

/**
 * Lend Market Activity Component
 * Market: 0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9 (WETH/crvUSD)
 */
const LendMarketActivityComponent = () => {
  const tradesData = useMemo(() => generateLlammaTrades(20, COLLATERAL_TOKEN, BORROW_TOKEN), [])
  const eventsData = useMemo(() => generateLlammaEvents(15, COLLATERAL_TOKEN, BORROW_TOKEN), [])

  const tradesTable = useCurveTable({ query: constQ(tradesData), columns: LLAMMA_TRADES_COLUMNS })

  const eventsTable = useCurveTable({ query: constQ(eventsData), columns: LLAMMA_EVENTS_COLUMNS })

  return (
    <Stack sx={{ gap: Spacing.md }}>
      <ActivityTable
        table={tradesTable}
        emptyState={{ title: 'No AMM trades found.' }}
        errorState={{ title: 'Could not load AMM trades.' }}
        expandedPanel={{ Body: MarketTradesExpandedPanel }}
      />
      <ActivityTable
        table={eventsTable}
        emptyState={{ title: 'No controller events found.' }}
        errorState={{ title: 'Could not load controller events.' }}
        expandedPanel={{ Body: MarketEventsExpandedPanel }}
        rowBreakdown={LLAMMA_EVENTS_BREAKDOWN}
      />
    </Stack>
  )
}

const meta: Meta = {
  title: 'EVM UI/Features/ActivityTable',
  decorators: [
    Story => (
      <WagmiProvider config={wagmiConfig}>
        <TestQueryProvider data={[]}>
          <Story />
        </TestQueryProvider>
      </WagmiProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Activity tables display trading and liquidity activity for Curve pools and markets. ' +
          'They support toggling between different activity types (trades/liquidity for DEX, AMM/Controller for lending).',
      },
    },
  },
}

export default meta

type DexStory = StoryObj<typeof DexPoolActivityComponent>
type LendStory = StoryObj<typeof LendMarketActivityComponent>

/**
 * DEX Pool Activity table showing swap and liquidity events.
 * Based on TriCrypto pool: 0x4eBdF703948ddCEA3B11f675B4D1Fba9d2414A14
 */
export const DexPoolActivity: DexStory = {
  render: () => <DexPoolActivityComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Activity table for DEX pools showing trades (Swaps tab) and liquidity events (Liquidity tab). ' +
          'This example uses mock data based on the TriCrypto pool (USDT/WBTC/WETH).',
      },
    },
  },
}

/**
 * Lend Market Activity table showing AMM trades and Controller events.
 * Based on lending market: 0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9
 */
export const LendMarketActivity: LendStory = {
  render: () => <LendMarketActivityComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Activity table for Lend markets (the same structure is used for crvUSD mint markets) showing AMM trades (AMM tab) and Controller events (Controller tab). ' +
          'This example uses mock data based on a WETH/crvUSD lending market.',
      },
    },
  },
}

const LoadingStateComponent = () => {
  const table = useCurveTable({ query: fakeLoadingQ<PoolTradeRow[]>(undefined), columns: POOL_TRADES_COLUMNS })
  return (
    <ActivityTable
      table={table}
      emptyState={{ title: 'Loading trades...' }}
      errorState={{ title: 'Could not load trades data.' }}
    />
  )
}

export const LoadingState: StoryObj = {
  render: () => <LoadingStateComponent />,
  parameters: { docs: { description: { story: 'Activity table in loading state showing skeleton rows.' } } },
}

const EmptyStateComponent = () => {
  const table = useCurveTable({ query: constQ([] as PoolTradeRow[]), columns: POOL_TRADES_COLUMNS })
  return (
    <ActivityTable
      table={table}
      emptyState={{ title: 'No swap data found.' }}
      errorState={{ title: 'Could not load swap data.' }}
    />
  )
}

export const EmptyState: StoryObj = {
  render: () => <EmptyStateComponent />,
  parameters: { docs: { description: { story: 'Activity table showing empty state with custom message.' } } },
}

const ErrorStateComponent = () => {
  const table = useCurveTable({
    query: q({ data: [] as PoolTradeRow[], isLoading: false, error: new Error('Could not load swap data.') }),
    columns: POOL_TRADES_COLUMNS,
  })
  return (
    <ActivityTable
      table={table}
      emptyState={{ title: 'No swap data found.' }}
      errorState={{ title: 'Could not load swap data.' }}
    />
  )
}

export const ErrorState: StoryObj = {
  render: () => <ErrorStateComponent />,
  parameters: { docs: { description: { story: 'Activity table showing error state with error message.' } } },
}
