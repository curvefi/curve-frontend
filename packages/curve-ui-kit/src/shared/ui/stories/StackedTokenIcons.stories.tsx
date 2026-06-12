import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { StackedTokenIcons } from '../StackedTokenIcons'

const TOKENS = [
  { symbol: 'crvUSD', address: CRVUSD_ADDRESS },
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
  { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
]

const OVERLAPS = [1 / 4, 1 / 3, 1 / 2]

const meta: Meta<typeof StackedTokenIcons> = {
  title: 'UI Kit/Widgets/StackedTokenIcons',
  component: StackedTokenIcons,
  argTypes: {
    blockchainId: {
      control: 'text',
      description: 'Network the tokens are on',
    },
    tokens: {
      control: 'object',
      description: 'Array of token objects with symbol and address',
    },
    size: {
      control: 'select',
      options: ['xs', 'mui-sm', 'mui-md', 'sm', 'lg', 'xl'],
      description: 'Token icon size',
    },
    overlap: {
      control: 'number',
      description: 'Percentage of icon width used for the overlap offset',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tokens: TOKENS.slice(0, 5),
  },
}

type Story = StoryObj<typeof StackedTokenIcons>

export const Default: Story = {}

export const OverlapPercentages: Story = {
  render: args => (
    <Stack sx={{ gap: 2 }}>
      {OVERLAPS.map(overlap => (
        <Stack key={overlap} direction="row" sx={{ alignItems: 'center', gap: 4 }}>
          <Typography variant="bodySRegular">{(overlap * 100).toFixed(0).toString()}%</Typography>
          <StackedTokenIcons {...args} overlap={overlap} />
        </Stack>
      ))}
    </Stack>
  ),
}

export default meta
