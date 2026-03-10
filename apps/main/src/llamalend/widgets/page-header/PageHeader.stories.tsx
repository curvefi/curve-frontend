import type { ComponentProps } from 'react'
import { ethAddress, zeroAddress } from 'viem'
import type { BorrowRate, SupplyRate, AvailableLiquidity } from '@/llamalend/features/market-details'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { Chain } from '@curvefi/prices-api'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHeader } from './PageHeader'

type PageHeaderProps = ComponentProps<typeof PageHeader>

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
  averageRateLabel: '30d',
  rebasingYield: 1.002,
  averageRebasingYield: 1.0018,
  totalBorrowRate: 1.08,
  totalAverageBorrowRate: 1.073,
  extraRewards: [],
  loading: false,
}

const supplyRate: SupplyRate = {
  rate: 2.032,
  averageRate: 2.028,
  averageRateLabel: '30d',
  supplyAprCrvMinBoost: 2.004,
  supplyAprCrvMaxBoost: 3.012,
  averageSupplyAprCrvMinBoost: 2.0035,
  averageSupplyAprCrvMaxBoost: 3.0105,
  rebasingYield: 1.001,
  averageRebasingYield: 1.0008,
  totalSupplyRateMinBoost: 4.037,
  totalSupplyRateMaxBoost: 4.045,
  totalAverageSupplyRateMinBoost: 4.034,
  totalAverageSupplyRateMaxBoost: 4.041,
  extraIncentives: [],
  averageTotalExtraIncentivesApr: 4.002,
  extraRewards: [],
  loading: false,
}

const availableLiquidity: AvailableLiquidity = {
  value: 12_500_000,
  max: 30_000_000,
  loading: false,
}

const meta: Meta<typeof PageHeader> = {
  title: 'Llamalend/Widgets/PageHeader',
  component: PageHeader,
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
type Story = StoryObj<typeof PageHeader>

const withWidth = (maxWidth: number | undefined, displayName: string) => {
  const WithWidth = (args: PageHeaderProps) => (
    <Box
      sx={{
        width: '100%',
        padding: '4rem 2rem',
        maxWidth: '100%',
        ...(maxWidth && { maxWidth }),
      }}
    >
      <PageHeader {...args} />
    </Box>
  )

  WithWidth.displayName = displayName
  return WithWidth
}

const baseArgs: Omit<PageHeaderProps, 'market' | 'supplyRate'> = {
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
      rate: null,
      averageRate: null,
      totalSupplyRateMinBoost: null,
      totalSupplyRateMaxBoost: null,
      totalAverageSupplyRateMinBoost: null,
      totalAverageSupplyRateMaxBoost: null,
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
