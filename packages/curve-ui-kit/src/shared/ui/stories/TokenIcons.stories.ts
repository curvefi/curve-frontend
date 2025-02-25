import type { Meta, StoryObj } from '@storybook/react'
import { TokenIcons } from '../TokenIcons'

const TOKENS = [
  {
    symbol: 'ETH',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
  {
    symbol: 'USDC',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  },
  {
    symbol: 'DAI',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  },
  {
    symbol: 'USDT',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  },
  {
    symbol: 'WBTC',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  },
  {
    symbol: 'CRV',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  },
  {
    symbol: 'CVX',
    address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
  },
  {
    symbol: 'FXS',
    address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
  },
  {
    symbol: 'FRAX',
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  },
]

const meta: Meta<typeof TokenIcons> = {
  title: 'UI Kit/Widgets/TokenIcons',
  component: TokenIcons,
  argTypes: {
    blockchainId: {
      control: 'text',
      description: 'Network the tokens are on',
    },
    tokens: {
      control: 'object',
      description: 'Array of token objects with symbol and address',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tokens: TOKENS.slice(0, 2),
  },
}

type Story = StoryObj<typeof TokenIcons>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenIcons displays multiple token logos in a grid layout',
        story: 'Default view with 2 tokens',
      },
    },
  },
}

// I tried to generate these stories programmatically but couldn't get it to work
export const OneToken: Story = {
  args: {
    tokens: TOKENS.slice(0, 1),
  },
}

export const ThreeTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 3),
  },
}

export const FourTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 4),
  },
}

export const FiveTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 5),
  },
}

export const SixTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 6),
  },
}

export const SevenTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 7),
  },
}

export const EightTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 8),
  },
}

export const NineTokens: Story = {
  args: {
    tokens: TOKENS.slice(0, 9),
  },
}

export default meta
