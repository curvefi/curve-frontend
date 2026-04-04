import type { ComponentProps } from 'react'
import { ethAddress, zeroAddress } from 'viem'
import type { BorrowRate, SupplyRate } from '@/llamalend/rates.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Chain } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { AvailableLiquidity } from './hooks/usePageHeader'
import { PageHeaderView } from './PageHeader'

type PageHeaderViewProps = ComponentProps<typeof PageHeaderView>

const blockchainId: Chain = 'ethereum'

const mintMarket: MintMarketTemplate = Object.assign(Object.create(MintMarketTemplate.prototype), {
  coins: ['crvUSD', 'ETH'],
  coinAddresses: [zeroAddress, ethAddress],
})

const lendMarket = {
  collateral_token: { symbol: 'wstETH', address: ethAddress },
  borrowed_token: { symbol: 'crvUSD', address: zeroAddress },
} as LendMarketTemplate

const borrowRate: BorrowRate = {
  rate: 2.082,
  averageRate: 2.075,
  averageCategory: 'llamalend.market.rate',
  rebasingYield: 1.002,
  averageRebasingYield: 1.0018,
  totalBorrowRate: 1.08,
  totalAverageBorrowRate: 1.073,
  extraRewards: [],
  loading: false,
}

const supplyRate: SupplyRate = {
  supplyApy: 2.032,
  averageLendApy: 2.028,
  averageCategory: 'llamalend.market.rate',
  supplyApyCrvMinBoost: 2.004,
  supplyApyCrvMaxBoost: 3.012,
  averageApyCrvMinBoost: 2.0035,
  averageApyCrvMaxBoost: 3.0105,
  rebasingYield: 1.001,
  averageRebasingYield: 1.0008,
  totalMinBoost: 4.037,
  totalMaxBoost: 4.045,
  totalAverageMinBoost: 4.034,
  totalAverageMaxBoost: 4.041,
  extraIncentives: [],
  extraIncentivesTotalApy: null,
  averageExtraIncentivesApy: 4.002,
  extraRewards: [],
  loading: false,
}

const availableLiquidity: AvailableLiquidity = {
  value: 12_500_000,
  max: 30_000_000,
  loading: false,
}

const meta: Meta<typeof PageHeaderView> = {
  title: 'Llamalend/Widgets/PageHeader',
  component: PageHeaderView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Page header for Llamalend markets with token pair, market type, and key metrics.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageHeaderView>

const withWidth = (maxWidth: number | undefined, displayName: string) => {
  const WithWidth = (args: PageHeaderViewProps) => (
    <Box
      sx={{
        width: '100%',
        padding: '4rem 2rem',
        maxWidth: '100%',
        ...(maxWidth && { maxWidth }),
      }}
    >
      <PageHeaderView {...args} />
    </Box>
  )

  WithWidth.displayName = displayName
  return WithWidth
}

const baseArgs: Omit<PageHeaderViewProps, 'market' | 'supplyRate'> = {
  isLoading: false,
  blockchainId,
  borrowRate,
  availableLiquidity,
}

export const MintMarketDesktop: Story = {
  render: withWidth(1000, 'MintMarketDesktopWidth'),
  args: {
    ...baseArgs,
    market: mintMarket,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mint market header in a 1000px container (desktop width).',
      },
    },
  },
}

export const LendMarketDesktop: Story = {
  render: withWidth(1000, 'LendMarketDesktopWidth'),
  args: {
    ...baseArgs,
    market: lendMarket,
    supplyRate,
  },
  parameters: {
    docs: {
      description: {
        story: 'Lend market header in a 1000px container (desktop width).',
      },
    },
  },
}

export const LendMarketLoading: Story = {
  render: withWidth(1000, 'LendMarketLoadingWidth'),
  args: {
    ...baseArgs,
    isLoading: true,
    market: lendMarket,
    borrowRate: {
      ...borrowRate,
      rate: null,
      averageRate: null,
      totalBorrowRate: null,
      totalAverageBorrowRate: null,
      loading: true,
    },
    supplyRate: {
      ...supplyRate,
      supplyApy: null,
      averageLendApy: null,
      totalMinBoost: null,
      totalMaxBoost: null,
      totalAverageMinBoost: null,
      totalAverageMaxBoost: null,
      loading: true,
    },
    availableLiquidity: { ...availableLiquidity, value: null, max: null, loading: true },
  },
  parameters: {
    docs: {
      description: {
        story: 'Lend market header loading state with borrow, supply, and liquidity metrics.',
      },
    },
  },
}
