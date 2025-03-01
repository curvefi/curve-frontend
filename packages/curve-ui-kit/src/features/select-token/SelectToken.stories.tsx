import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, Stack, Typography } from '@mui/material'
import { TokenSelector } from './'
import type { TokenOption } from './types'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const defaultTokens: TokenOption[] = [
  {
    chain: 'ethereum',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    label: 'Ethereum',
    volume: 1,
  },
  {
    chain: 'ethereum',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    label: 'Circle Dollar',
    volume: 2,
  },
  {
    chain: 'ethereum',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    label: 'Tether Dollar',
    volume: 3,
  },
  {
    chain: 'ethereum',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    label: 'Maker DAI',
    volume: 4,
  },
]

const defaultBalances = {
  [defaultTokens[0].address]: '32',
  [defaultTokens[1].address]: '1000.00',
  [defaultTokens[3].address]: '2000.00',
}

const defaultTokenPrices = {
  [defaultTokens[0].address]: 2600,
  [defaultTokens[1].address]: 0.996,
  [defaultTokens[2].address]: 1.01,
}

const defaultFavorites = [defaultTokens[0], defaultTokens[1]]

const defaultDisabledTokens = [defaultTokens[2].address]

const TokenSelectorComponent = ({
  selectedToken: selectedTokenInit,
  ...props
}: React.ComponentProps<typeof TokenSelector>) => {
  const [selectedToken, setSelectedToken] = useState(selectedTokenInit)

  return <TokenSelector {...props} selectedToken={selectedToken} onToken={setSelectedToken} />
}

const meta: Meta<typeof TokenSelector> = {
  title: 'UI Kit/Features/TokenSelector',
  component: TokenSelectorComponent,
  args: {
    selectedToken: defaultTokens[0],
    tokens: defaultTokens,
    favorites: defaultFavorites,
    balances: defaultBalances,
    tokenPrices: defaultTokenPrices,
    disabled: false,
    showSearch: true,
    showSettings: true,
    compact: false,
    error: '',
    disabledTokens: defaultDisabledTokens,
    disableSorting: false,
    onToken: (token) => console.log('Selected token:', token),
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
    showSearch: {
      control: 'boolean',
      description: 'Shows search input in token selector modal',
    },
    showSettings: {
      control: 'boolean',
      description: 'Shows settings button in token selector modal footer',
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
    customOptions: {
      control: false,
      description: 'Adds extra custom options to the modal, below the favorites',
    },

    onToken: {
      action: 'token selected',
      description: 'Callback when a token is selected',
    },
  },
}

type Story = StoryObj<typeof TokenSelector>

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

export const WithCustomOptions: Story = {
  args: {
    customOptions: (
      <Stack gap={Spacing.xs}>
        <Typography variant="headingXsBold">Custom Options</Typography>
        <Button variant="outlined" fullWidth onClick={() => console.log('Custom option clicked')}>
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
