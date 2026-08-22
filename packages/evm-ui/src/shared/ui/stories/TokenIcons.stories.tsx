import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { TokenIcons } from '../TokenIcons'

const { Spacing } = SizesAndSpaces

const TOKEN_ICON_SIZE_OPTIONS = ['md', 'lg', 'xl', 'xxl', '3xl', '4xl'] as const

const TOKENS = [
  { symbol: 'ETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f' },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'WBTC', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  { symbol: 'CRV', address: MAINNET_CRV_ADDRESS },
  { symbol: 'CVX', address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B' },
  { symbol: 'FXS', address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0' },
  { symbol: 'FRAX', address: '0x853d955aCEf822Db058eb8505911ED77F175b99e' },
  { symbol: 'stETH', address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' },
  { symbol: 'LDO', address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32' },
  { symbol: 'LINK', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { symbol: 'MKR', address: '0x9f8F72aA9304c8B593d555F12ef6589cC3A579A2' },
]

const TOKEN_COUNT_CASES = [0, 1, 2, 3, 4, 5, 9, 13] as const

const meta = {
  title: 'UI Kit/Widgets/TokenIcons',
  component: TokenIcons,
  argTypes: {
    blockchainId: {
      control: 'text',
      description: 'Network the tokens are on',
    },
    tokens: {
      control: 'object',
      description: 'Ordered array of token symbols and addresses',
    },
    size: {
      control: 'select',
      options: TOKEN_ICON_SIZE_OPTIONS,
      description: 'Responsive size of the complete icon group',
    },
    showChainIcon: {
      control: 'boolean',
      description: 'Whether to show the blockchain badge',
    },
    overflowMode: {
      control: 'select',
      options: ['counter', 'stack'],
      description: 'How to display token groups with five or more tokens',
    },
  },
  args: {
    blockchainId: 'ethereum',
    tokens: TOKENS.slice(0, 2),
    size: 'xl',
    showChainIcon: false,
    overflowMode: 'counter',
  },
  parameters: {
    docs: {
      description: {
        component:
          'TokenIcons displays one token directly, or arranges multiple tokens in a fixed responsive footprint.',
      },
    },
  },
} satisfies Meta<typeof TokenIcons>

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TokenCounts: Story = {
  render: args => (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: Spacing.xl }}>
      {TOKEN_COUNT_CASES.map(count => (
        <Stack key={count} sx={{ alignItems: 'center', gap: Spacing.md }}>
          <Typography variant="headingXsMedium">
            {count} token{count === 1 ? '' : 's'}
          </Typography>

          <TokenIcons {...args} tokens={TOKENS.slice(0, count)} />
          {count === 0 && (
            <Typography color="textSecondary" variant="bodyXsRegular">
              Renders null
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    controls: { exclude: ['tokens'] },
    docs: {
      description: {
        story: 'Layouts for 0–5 and 9 tokens.',
      },
    },
  },
}

export const AllSizes: Story = {
  render: args => (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: Spacing.xl }}>
      {TOKEN_ICON_SIZE_OPTIONS.map(size => (
        <Stack key={size} sx={{ alignItems: 'center', gap: Spacing.md }}>
          <Typography variant="headingXsMedium">{size}</Typography>
          <TokenIcons {...args} size={size} />
        </Stack>
      ))}
    </Stack>
  ),
  parameters: {
    controls: { exclude: ['size'] },
    docs: {
      description: {
        story: 'Every responsive IconSize design token, from xxs through 4xl.',
      },
    },
  },
}

export const WithChainIcon: Story = {
  args: { showChainIcon: true },
  render: args => (
    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xl }}>
      <TokenIcons {...args} tokens={TOKENS.slice(0, 1)} />
      <TokenIcons {...args} tokens={TOKENS.slice(0, 2)} />
      <TokenIcons {...args} tokens={TOKENS.slice(0, 3)} />
      <TokenIcons {...args} tokens={TOKENS.slice(0, 4)} />
      <TokenIcons {...args} tokens={TOKENS.slice(0, 9)} overflowMode="stack" />
    </Stack>
  ),
  parameters: {
    controls: { exclude: ['tokens'] },
    docs: {
      description: {
        story: 'Chain badges on one through four tokens and an overflow stack.',
      },
    },
  },
}

export const WithStackOverflow: Story = {
  args: {
    tokens: TOKENS.slice(0, 9),
    overflowMode: 'stack',
  },
  parameters: {
    docs: {
      description: {
        story: 'Nine tokens using the stacked overflow treatment instead of the overflow counter.',
      },
    },
  },
}

export const WithFallback: Story = {
  args: {
    tokens: [{ symbol: 'UNKNOWN', address: '0x0' }, TOKENS[0]],
  },
  parameters: {
    docs: {
      description: {
        story: 'An unavailable token image falls back while preserving its symbol as alt text.',
      },
    },
  },
}

export default meta
