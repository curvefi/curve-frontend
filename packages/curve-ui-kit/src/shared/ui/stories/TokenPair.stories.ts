import type { Meta, StoryObj } from '@storybook/react'
import { TokenPair } from '../TokenPair'

const meta: Meta<typeof TokenPair> = {
  title: 'UI Kit/Widgets/TokenPair',
  component: TokenPair,
  argTypes: {
    chain: {
      control: 'text',
      description: 'Network the tokens are on',
    },
    assets: {
      control: 'object',
      description: 'Token pair details',
    },
  },
  args: {
    chain: 'ethereum',
    assets: {
      borrowed: {
        symbol: 'ETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      collateral: {
        symbol: 'USDC',
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
    },
  },
}

type Story = StoryObj<typeof TokenPair>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenPair displays two token logos with a chain indicator',
        story: 'Default view showing ETH-USDC pair on Ethereum',
      },
    },
  },
}

export const ArbitrumPair: Story = {
  args: {
    chain: 'arbitrum',
    assets: {
      borrowed: {
        symbol: 'WBTC',
        address: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
      },
      collateral: {
        symbol: 'USDT',
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      },
    },
  },
}

export const WithFallback: Story = {
  args: {
    assets: {
      borrowed: {
        symbol: 'UNKNOWN',
        address: '0x0',
      },
      collateral: {
        symbol: 'ETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
    },
  },
}

export default meta
