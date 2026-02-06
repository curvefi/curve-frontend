import type { Chain } from '@curvefi/prices-api'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { generateMarketTitle } from './page-header.utils'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'UI Kit/Widgets/PageHeader',
  component: PageHeader,
  args: {
    title: generateMarketTitle('wstETH', 'crvUSD'),
    subtitle: 'Collateralized debt position',
    pageType: 'Mint',
    chain: 'ethereum' as Chain,
    assets: {
      collateral: {
        symbol: 'wstETH',
        address: '0x0000000000000000000000000000000000000001',
      },
      borrowed: {
        symbol: 'crvUSD',
        address: '0x0000000000000000000000000000000000000002',
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    pageType: { control: 'radio', options: ['Lend', 'Mint'] },
    chain: { control: 'text' },
    assets: { control: 'object' },
  },
}

export default meta

type Story = StoryObj<typeof PageHeader>

export const Default: Story = {}

export const Lend: Story = {
  args: {
    pageType: 'Lend',
    title: generateMarketTitle('USDC', 'USDT'),
    subtitle: 'Supply collateral and borrow assets',
    chain: 'arbitrum' as Chain,
    assets: {
      collateral: {
        symbol: 'USDC',
        address: '0x0000000000000000000000000000000000000003',
      },
      borrowed: {
        symbol: 'USDT',
        address: '0x0000000000000000000000000000000000000004',
      },
    },
  },
}
