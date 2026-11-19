import { fromDate } from '@curvefi/prices-api/timestamp'
import { ActivityStoryProviders, ActivityStoryTable } from '@evm-ui/features/activity-table/ActivityTable.stories'
import Stack from '@mui/material/Stack'
import type { Address, Token } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { constQ } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MarketBorrowEventRow, MarketTradeRow } from './types'
import { toMarketActivityBorrowEventRow, toMarketActivitySwapRow } from './utils'

const { Spacing } = SizesAndSpaces

const generateAddress = (seed: number): Address => `0x${seed.toString(16).padStart(40, '0')}`
const generateTxHash = (seed: number): Address => `0x${seed.toString(16).padStart(64, '0')}`

// Lending Mock Tokens (WETH/crvUSD market)
const COLLATERAL_TOKEN: Token = { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }

const BORROW_TOKEN: Token = { symbol: 'crvUSD', address: '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E' }

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
const generateLlammaEvents = (count: number, collateralToken: Token, borrowToken: Token): MarketBorrowEventRow[] => {
  const now = Date.now()

  return Array.from({ length: count }, (_, i) => {
    const isDeposit = i % 3 !== 2 // 2/3 deposits, 1/3 withdrawals
    const hasBorrowedTokens = i % 2 === 0 // half of the withdrawals return both collateral and borrowed tokens

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
            amountUsd: i === 0 ? null : i === 1 ? 0 : 2500,
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
            amountBorrowed: hasBorrowedTokens ? Math.random() * 5000 + 100 : 0,
            amountBorrowedUsd: hasBorrowedTokens ? 1000 : 0,
            amountCollateral: Math.random() * 2 + 0.1,
            amountCollateralUsd: i === 2 ? null : 3000,
          },
        }
  })
}

const swapsQuery = constQ(generateLlammaTrades(20, COLLATERAL_TOKEN, BORROW_TOKEN).map(toMarketActivitySwapRow))
const eventsQuery = constQ(generateLlammaEvents(15, COLLATERAL_TOKEN, BORROW_TOKEN).map(toMarketActivityBorrowEventRow))

const meta: Meta = {
  title: 'Llamalend/Features/MarketActivity',
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
 * Lend Market Activity tables showing AMM swaps and collateral events.
 * Based on lending market: 0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9
 */
export const LendMarketActivity: StoryObj<typeof meta> = {
  render: () => (
    <Stack sx={{ gap: Spacing.md }}>
      <ActivityStoryTable
        query={swapsQuery}
        hasValue={false}
        emptyTitle="No AMM trades found."
        errorTitle="Could not load AMM trades."
      />
      <ActivityStoryTable
        query={eventsQuery}
        emptyTitle="No activity data found."
        errorTitle="Could not load activity data."
      />
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Activity tables for lending and crvUSD mint markets showing AMM swaps and collateral events. ' +
          'This example uses mock data based on a WETH/crvUSD lending market.',
      },
    },
  },
}
