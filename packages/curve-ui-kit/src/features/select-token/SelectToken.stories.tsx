import { type ComponentProps, type ReactNode, useState } from 'react'
import { action } from 'storybook/actions'
import { ethAddress } from 'viem'
import { Button, Stack, Typography } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TokenOption } from './types'
import { TokenList, type TokenListProps } from './ui/modal/TokenList'
import { TokenSelector } from './'

const { Spacing } = SizesAndSpaces

const defaultTokens: TokenOption[] = [
  {
    chain: 'ethereum',
    address: ethAddress,
    symbol: 'ETH',
    label: 'Ethereum',
    volume: 17,
  },
  {
    chain: 'ethereum',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    label: 'Circle Dollar',
    volume: 16,
  },
  {
    chain: 'ethereum',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    symbol: 'WBTC',
    label: 'Wrapped Bitcoin',
    volume: 15,
  },
  {
    chain: 'ethereum',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    label: 'Tether Dollar',
    volume: 14,
  },
  {
    chain: 'ethereum',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    label: 'Maker DAI',
    volume: 13,
  },
  {
    chain: 'ethereum',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    symbol: 'CRV',
    label: 'Curve DAO Token',
    volume: 12,
  },
  {
    chain: 'ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    label: 'Wrapped Ether',
    volume: 11,
  },
  {
    chain: 'ethereum',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    symbol: 'LINK',
    label: 'Chainlink',
    volume: 10,
  },
  {
    chain: 'ethereum',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    symbol: 'AAVE',
    label: 'Aave',
    volume: 9,
  },
  {
    chain: 'ethereum',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    symbol: 'UNI',
    label: 'Uniswap',
    volume: 8,
  },
  {
    chain: 'ethereum',
    address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
    symbol: 'FRAX',
    label: 'Frax',
    volume: 7,
  },
  {
    chain: 'ethereum',
    address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    symbol: 'YFI',
    label: 'yearn.finance',
    volume: 6,
  },
  {
    chain: 'ethereum',
    address: '0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0',
    symbol: 'FXS',
    label: 'Frax Share',
    volume: 5,
  },
  {
    chain: 'ethereum',
    address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    symbol: 'stETH',
    label: 'Lido Staked ETH',
    volume: 4,
  },
  {
    chain: 'ethereum',
    address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
    symbol: 'CVX',
    label: 'Convex Finance',
    volume: 3,
  },
  {
    chain: 'ethereum',
    address: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    symbol: 'LDO',
    label: 'Lido DAO Token',
    volume: 2,
  },
  {
    chain: 'ethereum',
    address: '0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF',
    symbol: 'ALCX',
    label: 'Alchemix',
    volume: 1,
  },
  {
    chain: 'ethereum',
    address: '0x3231Cb76718CDeF2155FC47b5286d82e6eDA273f',
    symbol: 'EURE',
    label: 'Monerium EUR emoney',
    volume: 0.9,
  },
  {
    chain: 'ethereum',
    address: '0x365AccFCa291e7D3914637ABf1F7635dB165Bb09',
    symbol: 'FXN',
    label: 'f(x)',
    volume: 0.8,
  },
  {
    chain: 'ethereum',
    address: '0x0D57436F2d39c0664C6f0f2E349229483f87EA38',
    symbol: 'A7A5',
    label: 'Ruble regulation circumvention token',
    volume: 2.5,
  },
]

const defaultBalances = {
  [defaultTokens[0].address]: '32',
  [defaultTokens[1].address]: '1000.00',
  [defaultTokens[8].address]: '2000.00',
  [defaultTokens[13].address]: '123.45',
  [defaultTokens[14].address]: '1337.00',
  [defaultTokens[15].address]: '69.420',
}

const defaultTokenPrices = {
  [defaultTokens[0].address]: 2600,
  [defaultTokens[1].address]: 0.996,
  [defaultTokens[2].address]: 1.01,
}

const defaultFavorites = [defaultTokens[0], defaultTokens[1]]

const defaultDisabledTokens = [defaultTokens[2].address]

type TokenSelectorStoryProps = Omit<ComponentProps<typeof TokenSelector>, 'children'> &
  Omit<TokenListProps, 'onToken' | 'children'> & {
    listChildren?: ReactNode
  }

const TokenSelectorComponent = ({
  selectedToken: selectedTokenInit,
  tokens,
  balances,
  tokenPrices,
  favorites,
  disableSearch,
  error,
  disabledTokens,
  disableSorting,
  disableMyTokens,
  onSearch,
  listChildren,
  ...props
}: TokenSelectorStoryProps) => {
  const [selectedToken, setSelectedToken] = useState(selectedTokenInit)
  const [isOpen, open, close] = useSwitch()

  return (
    <TokenSelector {...props} selectedToken={selectedToken} isOpen={!!isOpen} onOpen={open} onClose={close}>
      <TokenList
        tokens={tokens}
        balances={balances}
        tokenPrices={tokenPrices}
        favorites={favorites}
        disableSearch={disableSearch}
        error={error}
        disabledTokens={disabledTokens}
        disableSorting={disableSorting}
        disableMyTokens={disableMyTokens}
        onToken={(newToken) => {
          action('onToken')(newToken)
          setSelectedToken(newToken)
        }}
        onSearch={onSearch}
      >
        {listChildren}
      </TokenList>
    </TokenSelector>
  )
}

const meta: Meta<typeof TokenSelectorComponent> = {
  title: 'UI Kit/Features/TokenSelector',
  component: TokenSelectorComponent,
  args: {
    selectedToken: defaultTokens[0],
    tokens: defaultTokens,
    favorites: defaultFavorites,
    balances: defaultBalances,
    tokenPrices: defaultTokenPrices,
    disabled: false,
    compact: false,
    error: '',
    disabledTokens: defaultDisabledTokens,
  },
  argTypes: {
    tokens: {
      control: 'object',
      description: 'Array of token options to display in selector',
    },
    favorites: {
      control: 'object',
      description: 'Array of favorite token options to display in selector',
    },
    balances: {
      control: 'object',
      description: 'Record of token balances by address',
    },
    tokenPrices: {
      control: 'object',
      description: 'Record of token prices in USD by address',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the token selector button and modal',
    },
    disableSearch: {
      control: 'boolean',
      description: 'Disables search input in token selector modal',
    },
    compact: {
      control: 'boolean',
      description: 'Renders the modal in a compact size',
    },
    selectedToken: {
      control: 'object',
      description: 'Currently selected token',
    },
    error: {
      control: 'text',
      description: 'Custom error message to display in the token selector modal',
    },
    disabledTokens: {
      control: 'object',
      description: 'Array of token addresses that should be disabled in the selector',
    },
    disableSorting: {
      control: 'boolean',
      description: 'Disable automatic sorting so you can apply your own in the tokens property',
    },
    listChildren: {
      control: false,
      description: 'Adds extra custom options to the modal, below the favorites',
    },
    disableMyTokens: {
      control: 'boolean',
      description: 'Disables the "My Tokens" tab in the token selector modal',
    },
    onSearch: {
      action: 'search updated',
      description: 'Callback when user enters text in the search input',
    },
  },
}

type Story = StoryObj<typeof TokenSelectorComponent>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'TokenSelector allows selecting a token from a list with search, favorites and balances',
        story: 'Default view showing token selector button that opens modal',
      },
    },
  },
}

export const NoSelectedToken: Story = {
  args: {
    selectedToken: undefined,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token selector with no token selected initially',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    error: 'Failed to load tokens. Please try again later.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Token selector displaying an error message',
      },
    },
  },
}

export const CompactMode: Story = {
  args: {
    compact: true,
    favorites: [],
    tokens: defaultTokens.slice(0, 3),
    disableMyTokens: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Token selector in compact mode with reduced size modal',
      },
    },
  },
}

export const WithCustomOptions: Story = {
  args: {
    listChildren: (
      <Stack gap={Spacing.xs}>
        <Typography variant="headingXsBold">Custom Options</Typography>
        <Button variant="outlined" fullWidth onClick={() => console.info('Custom option clicked')}>
          Add Custom Token
        </Button>
      </Stack>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Token selector with custom options displayed below favorites',
      },
    },
  },
}

export default meta
