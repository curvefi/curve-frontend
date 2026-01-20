import { useState, useMemo } from 'react'
import type { Address, Chain } from '@curvefi/prices-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActivityTable } from './ActivityTable'
import {
  createPoolTradesColumns,
  createPoolLiquidityColumns,
  createLlammaTradesColumns,
  createLlammaEventsColumns,
} from './columns'
import {
  PoolTradesExpandedPanel,
  PoolLiquidityExpandedPanel,
  LlammaTradesExpandedPanel,
  LlammaEventsExpandedPanel,
} from './panels'
import type {
  PoolTradeRow,
  PoolLiquidityRow,
  LlammaTradeRow,
  LlammaEventRow,
  PoolActivitySelection,
  LlammaActivitySelection,
  ActivitySelection,
  Token,
} from './types'

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateAddress = (seed: number): Address => `0x${seed.toString(16).padStart(40, '0')}` as Address

const generateTxHash = (seed: number): Address => `0x${seed.toString(16).padStart(64, '0')}` as Address

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
const COLLATERAL_TOKEN: Token = {
  symbol: 'WETH',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as Address,
}

const BORROW_TOKEN: Token = {
  symbol: 'crvUSD',
  address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as Address,
}

// crvUSD Mock Tokens (sfrxETH market)
const CRVUSD_COLLATERAL_TOKEN: Token = {
  symbol: 'sfrxETH',
  address: '0xac3E018457B222d93114458476f3E3416Abbe38F' as Address,
}

const CRVUSD_BORROW_TOKEN: Token = {
  symbol: 'crvUSD',
  address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' as Address,
}

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
      time: new Date(now - i * 3600000), // 1 hour apart
      txHash: generateTxHash(1000 + i),
      buyer: generateAddress(2000 + i),
      fee: Math.random() * 0.01,
      usdFee: Math.random() * 10,
      tokenSold,
      tokenBought,
      poolState: null,
      url: `https://etherscan.io/tx/${generateTxHash(1000 + i)}`,
      network: 'ethereum' as Chain,
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
    time: new Date(now - i * 7200000), // 2 hours apart
    txHash: generateTxHash(3000 + i),
    provider: generateAddress(4000 + i),
    url: `https://etherscan.io/tx/${generateTxHash(3000 + i)}`,
    network: 'ethereum' as Chain,
    poolTokens: POOL_TOKENS,
  }))
}

// Llamma Trades Mock Data Generator
const generateLlammaTrades = (count: number, collateralToken: Token, borrowToken: Token): LlammaTradeRow[] => {
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
      timestamp: new Date(now - i * 1800000), // 30 minutes apart
      txHash: generateTxHash(5000 + i),
      url: `https://etherscan.io/tx/${generateTxHash(5000 + i)}`,
      network: 'ethereum' as Chain,
    }
  })
}

// Llamma Events Mock Data Generator
const generateLlammaEvents = (count: number, collateralToken: Token, borrowToken: Token): LlammaEventRow[] => {
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const isDeposit = i % 3 !== 2 // 2/3 deposits, 1/3 withdrawals

    return {
      provider: generateAddress(6000 + i),
      deposit: isDeposit
        ? {
            amount: Math.random() * 10 + 0.5,
            n1: Math.floor(Math.random() * 50),
            n2: Math.floor(Math.random() * 50) + 50,
          }
        : null,
      withdrawal: !isDeposit
        ? {
            amountBorrowed: Math.random() * 5000 + 100,
            amountCollateral: Math.random() * 2 + 0.1,
          }
        : null,
      blockNumber: 19000000 + i * 60,
      timestamp: new Date(now - i * 3600000), // 1 hour apart
      txHash: generateTxHash(6000 + i),
      url: `https://etherscan.io/tx/${generateTxHash(6000 + i)}`,
      network: 'ethereum' as Chain,
      collateralToken,
      borrowToken,
    }
  })
}

// ============================================================================
// Selection Options
// ============================================================================

const POOL_ACTIVITY_SELECTIONS: ActivitySelection<PoolActivitySelection>[] = [
  { key: 'trades', label: 'Swaps' },
  { key: 'liquidity', label: 'Liquidity' },
]

const LLAMMA_ACTIVITY_SELECTIONS: ActivitySelection<LlammaActivitySelection>[] = [
  { key: 'trades', label: 'AMM' },
  { key: 'events', label: 'Controller' },
]

// ============================================================================
// Story Components
// ============================================================================

/**
 * DEX Pool Activity Component
 * Pool: TriCrypto (0x4eBdF703948ddCEA3B11f675B4D1Fba9d2414A14)
 */
const DexPoolActivityComponent = () => {
  const [activeSelection, setActiveSelection] = useState<PoolActivitySelection>('trades')

  const tradesData = useMemo(() => generatePoolTrades(20), [])
  const liquidityData = useMemo(() => generatePoolLiquidity(15), [])
  const tradesColumns = useMemo(() => createPoolTradesColumns(), [])
  const liquidityColumns = useMemo(() => createPoolLiquidityColumns(), [])

  const tradesTableConfig = {
    data: tradesData,
    columns: tradesColumns,
    isLoading: false,
    emptyMessage: 'No trades data found.',
  }

  const liquidityTableConfig = {
    data: liquidityData,
    columns: liquidityColumns,
    isLoading: false,
    emptyMessage: 'No liquidity data found.',
  }

  return (
    <>
      {activeSelection === 'trades' && (
        <ActivityTable
          selections={POOL_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={PoolTradesExpandedPanel}
        />
      )}
      {activeSelection === 'liquidity' && (
        <ActivityTable
          selections={POOL_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={liquidityTableConfig}
          expandedPanel={PoolLiquidityExpandedPanel}
        />
      )}
    </>
  )
}

/**
 * Lend Market Activity Component
 * Market: 0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9 (WETH/crvUSD)
 */
const LendMarketActivityComponent = () => {
  const [activeSelection, setActiveSelection] = useState<LlammaActivitySelection>('trades')

  const tradesData = useMemo(() => generateLlammaTrades(20, COLLATERAL_TOKEN, BORROW_TOKEN), [])
  const eventsData = useMemo(() => generateLlammaEvents(15, COLLATERAL_TOKEN, BORROW_TOKEN), [])
  const tradesColumns = useMemo(() => createLlammaTradesColumns(), [])
  const eventsColumns = useMemo(() => createLlammaEventsColumns(), [])

  const tradesTableConfig = {
    data: tradesData,
    columns: tradesColumns,
    isLoading: false,
    emptyMessage: 'No AMM trades found.',
  }

  const eventsTableConfig = {
    data: eventsData,
    columns: eventsColumns,
    isLoading: false,
    emptyMessage: 'No controller events found.',
  }

  return (
    <>
      {activeSelection === 'trades' && (
        <ActivityTable
          selections={LLAMMA_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={LlammaTradesExpandedPanel}
        />
      )}
      {activeSelection === 'events' && (
        <ActivityTable
          selections={LLAMMA_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={eventsTableConfig}
          expandedPanel={LlammaEventsExpandedPanel}
        />
      )}
    </>
  )
}

/**
 * crvUSD Market Activity Component
 * Market: 0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635 (sfrxETH)
 */
const CrvusdMarketActivityComponent = () => {
  const [activeSelection, setActiveSelection] = useState<LlammaActivitySelection>('trades')

  const tradesData = useMemo(() => generateLlammaTrades(20, CRVUSD_COLLATERAL_TOKEN, CRVUSD_BORROW_TOKEN), [])
  const eventsData = useMemo(() => generateLlammaEvents(15, CRVUSD_COLLATERAL_TOKEN, CRVUSD_BORROW_TOKEN), [])
  const tradesColumns = useMemo(() => createLlammaTradesColumns(), [])
  const eventsColumns = useMemo(() => createLlammaEventsColumns(), [])

  const tradesTableConfig = {
    data: tradesData,
    columns: tradesColumns,
    isLoading: false,
    emptyMessage: 'No AMM trades found.',
  }

  const eventsTableConfig = {
    data: eventsData,
    columns: eventsColumns,
    isLoading: false,
    emptyMessage: 'No controller events found.',
  }

  return (
    <>
      {activeSelection === 'trades' && (
        <ActivityTable
          selections={LLAMMA_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={tradesTableConfig}
          expandedPanel={LlammaTradesExpandedPanel}
        />
      )}
      {activeSelection === 'events' && (
        <ActivityTable
          selections={LLAMMA_ACTIVITY_SELECTIONS}
          activeSelection={activeSelection}
          onSelectionChange={setActiveSelection}
          tableConfig={eventsTableConfig}
          expandedPanel={LlammaEventsExpandedPanel}
        />
      )}
    </>
  )
}

// ============================================================================
// Storybook Meta
// ============================================================================

const meta: Meta = {
  title: 'UI Kit/Features/ActivityTable',
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

// ============================================================================
// Stories
// ============================================================================

type DexStory = StoryObj<typeof DexPoolActivityComponent>
type LendStory = StoryObj<typeof LendMarketActivityComponent>
type CrvusdStory = StoryObj<typeof CrvusdMarketActivityComponent>

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
          'Activity table for Lend markets showing AMM trades (AMM tab) and Controller events (Controller tab). ' +
          'This example uses mock data based on a WETH/crvUSD lending market.',
      },
    },
  },
}

/**
 * crvUSD Market Activity table showing AMM trades and Controller events.
 * Based on crvUSD market: 0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635
 */
export const CrvusdMarketActivity: CrvusdStory = {
  render: () => <CrvusdMarketActivityComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Activity table for crvUSD markets showing AMM trades (AMM tab) and Controller events (Controller tab). ' +
          'This example uses mock data based on an sfrxETH/crvUSD market.',
      },
    },
  },
}

/**
 * Loading state demonstration
 */
export const LoadingState: StoryObj = {
  render: () => {
    const tradesColumns = createPoolTradesColumns()

    return (
      <ActivityTable
        selections={POOL_ACTIVITY_SELECTIONS}
        activeSelection="trades"
        onSelectionChange={() => {}}
        tableConfig={{
          data: [],
          columns: tradesColumns,
          isLoading: true,
          emptyMessage: 'Loading trades...',
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Activity table in loading state showing skeleton rows.',
      },
    },
  },
}

/**
 * Empty state demonstration
 */
export const EmptyState: StoryObj = {
  render: () => {
    const tradesColumns = createPoolTradesColumns()

    return (
      <ActivityTable
        selections={POOL_ACTIVITY_SELECTIONS}
        activeSelection="trades"
        onSelectionChange={() => {}}
        tableConfig={{
          data: [],
          columns: tradesColumns,
          isLoading: false,
          emptyMessage: 'No activity found for this pool.',
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Activity table showing empty state with custom message.',
      },
    },
  },
}

/**
 * Error state demonstration
 */
export const ErrorState: StoryObj = {
  render: () => {
    const tradesColumns = createPoolTradesColumns()

    return (
      <ActivityTable
        selections={POOL_ACTIVITY_SELECTIONS}
        activeSelection="trades"
        onSelectionChange={() => {}}
        tableConfig={{
          data: [],
          columns: tradesColumns,
          isLoading: false,
          isError: true,
          emptyMessage: 'Failed to load activity data. Please try again later.',
        }}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Activity table showing error state with error message.',
      },
    },
  },
}
