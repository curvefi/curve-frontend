import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { IconStack } from '../IconStack'
import { TokenIcon } from '../TokenIcon'

const BLOCKCHAIN_IDS = [
  'ethereum',
  'arbitrum',
  'optimism',
  'base',
  'polygon',
  'gnosis',
  'avalanche',
  'fantom',
  'sonic',
  'fraxtal',
]

const TOKENS = [
  { symbol: 'crvUSD', address: CRVUSD_ADDRESS },
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
  { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
]

type IconStackSize = NonNullable<Parameters<typeof IconStack>[0]['iconSize']>

const ICON_SIZE_OPTIONS: IconStackSize[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl']
const OVERLAPS = [1 / 4, 1 / 3, 1 / 2]

const meta: Meta<typeof IconStack> = {
  title: 'UI Kit/Widgets/IconStack',
  component: IconStack,
  argTypes: {
    iconSize: {
      control: 'select',
      options: ICON_SIZE_OPTIONS,
      description: 'Responsive icon size token used for overlap calculations',
    },
    overlap: {
      control: 'number',
      description: 'Percentage of icon width used for the overlap offset',
    },
  },
  args: {
    iconSize: 'md',
  },
}

type Story = StoryObj<typeof IconStack>

export const ChainIcons: Story = {
  render: ({ iconSize = 'md', ...args }) => (
    <IconStack {...args} iconSize={iconSize}>
      {BLOCKCHAIN_IDS.map(blockchainId => (
        <ChainIcon key={blockchainId} blockchainId={blockchainId} size={iconSize} border />
      ))}
    </IconStack>
  ),
}

export const TokenIcons: Story = {
  args: {
    iconSize: 'lg',
  },
  render: args => (
    <IconStack {...args}>
      {TOKENS.map(({ address, symbol }) => (
        <TokenIcon key={`${address}-${symbol}`} blockchainId="ethereum" address={address} tooltip={symbol} />
      ))}
    </IconStack>
  ),
}

export const OverlapPercentages: Story = {
  render: ({ iconSize = 'md', ...args }) => (
    <Stack sx={{ gap: 2 }}>
      {OVERLAPS.map(overlap => (
        <Stack key={overlap} direction="row" sx={{ alignItems: 'center', gap: 4 }}>
          <Typography variant="bodySRegular">{(overlap * 100).toFixed(0).toString()}%</Typography>
          <IconStack {...args} iconSize={iconSize} overlap={overlap}>
            {BLOCKCHAIN_IDS.slice(0, 5).map(blockchainId => (
              <ChainIcon key={blockchainId} blockchainId={blockchainId} size={iconSize} border />
            ))}
          </IconStack>
          <IconStack iconSize="lg" overlap={overlap}>
            {TOKENS.map(({ address, symbol }) => (
              <TokenIcon key={`${address}-${symbol}`} blockchainId="ethereum" address={address} tooltip={symbol} />
            ))}
          </IconStack>
        </Stack>
      ))}
    </Stack>
  ),
}

export default meta
