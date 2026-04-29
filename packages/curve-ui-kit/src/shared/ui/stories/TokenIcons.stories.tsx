import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MAINNET_CRV_ADDRESS } from '@ui-kit/utils'
import { TokenIcons, type TokenIconsProps } from '../TokenIcons'

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
]

const TokenIconsStory = (props: Omit<TokenIconsProps, 'variant'>) => {
  const ref = useRef<HTMLDivElement>(null)
  const [[sizeDefault, sizeIcons], setSizes] = useState<DOMRect[]>([])
  useEffect(() => {
    const interval = setInterval(
      () =>
        setSizes(
          Array.from(ref.current?.querySelectorAll('[data-testid="token-icons"]') ?? []).map(el =>
            el.getBoundingClientRect(),
          ),
        ),
      1000,
    )
    return () => clearInterval(interval)
  }, [])
  return (
    <Stack gap={5} ref={ref} width={300}>
      <Box>
        <Typography variant="headingXsMedium">
          Default Variant
          <Typography variant="bodyXsRegular" component="span">
            {' '}
            ({sizeDefault?.width}x{sizeDefault?.height}px)
          </Typography>
        </Typography>
        <TokenIcons {...props} />
      </Box>
      <Box>
        <Typography variant="headingXsMedium">
          Icon Variant
          <Typography variant="bodyXsRegular" component="span">
            {' '}
            ({sizeIcons?.width}x{sizeIcons?.height}px)
          </Typography>
        </Typography>
        <TokenIcons {...props} variant="icon" />
      </Box>
    </Stack>
  )
}

const meta: Meta<typeof TokenIcons> = {
  title: 'UI Kit/Widgets/TokenIcons',
  component: TokenIconsStory,
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
export const OneToken: Story = { args: { tokens: TOKENS.slice(0, 1) } }
export const ThreeTokens: Story = { args: { tokens: TOKENS.slice(0, 3) } }
export const FourTokens: Story = { args: { tokens: TOKENS.slice(0, 4) } }
export const FiveTokens: Story = { args: { tokens: TOKENS.slice(0, 5) } }
export const SixTokens: Story = { args: { tokens: TOKENS.slice(0, 6) } }
export const SevenTokens: Story = { args: { tokens: TOKENS.slice(0, 7) } }
export const EightTokens: Story = { args: { tokens: TOKENS.slice(0, 8) } }
export const NineTokens: Story = { args: { tokens: TOKENS.slice(0, 9) } }

export default meta
