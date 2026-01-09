import { useRef, useState } from 'react'
import { fn } from 'storybook/test'
import { Select, MenuItem, Typography, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Decimal } from '@ui-kit/utils'
import { LargeTokenInput, type LargeTokenInputRef, type LargeTokenInputProps } from '../LargeTokenInput'

// Test options for token selector with corresponding pre-seeded wallet balances
type Token = { name: string; walletBalance: { symbol: string; balance: Decimal; notionalValueUsd?: Decimal } }
const TOKEN_OPTIONS: Token[] = [
  { name: 'Inferium', walletBalance: { symbol: 'ETH', balance: '1000', notionalValueUsd: '2000' } },
  { name: 'Bitcorn', walletBalance: { symbol: 'BTC', balance: '2500', notionalValueUsd: '125000' } },
  { name: 'The Ripple', walletBalance: { symbol: 'RPL', balance: '5000', notionalValueUsd: '10000' } },
  { name: 'Decimalator', walletBalance: { symbol: 'DEC', balance: '69.4201337', notionalValueUsd: '138.84' } },
]

const DEFAULT_MAX_BALANCE: LargeTokenInputProps['maxBalance'] = {
  balance: '420420.1337',
  showSlider: true,
  chips: 'range',
}

const TokenSelector = ({
  onTokenChange,
}: {
  onTokenChange: (tokenInfo: { balance: Decimal; symbol: string }) => void
}) => {
  const [value, setValue] = useState(TOKEN_OPTIONS[0].name)

  return (
    <Select
      value={value}
      onChange={(e) => {
        const selectedToken = e.target.value
        setValue(selectedToken)
        const selectedOption = TOKEN_OPTIONS.find((option) => option.name === selectedToken)
        if (selectedOption) onTokenChange(selectedOption.walletBalance)
      }}
      size="small"
      displayEmpty
      renderValue={() => <Typography>{value || 'Select token'}</Typography>}
      sx={{
        width: '10rem',
        backgroundColor: (t) => t.design.Layer[1].Fill,
      }}
    >
      {TOKEN_OPTIONS.map((option) => (
        <MenuItem key={option.name} value={option.name}>
          {option.name}
        </MenuItem>
      ))}
    </Select>
  )
}

const LargeTokenInputWithTokenSelector = (props: LargeTokenInputProps) => {
  const inputRef = useRef<LargeTokenInputRef>(null)
  const [walletBalance, setWalletBalance] = useState(props.walletBalance)

  return (
    <LargeTokenInput
      {...props}
      walletBalance={walletBalance}
      tokenSelector={
        <TokenSelector
          onTokenChange={(newToken) => {
            // Check if for the WithoutWalletBalance story so selecting a token won't make pop up the wallet balance.
            if (walletBalance) setWalletBalance(newToken)
            inputRef.current?.resetBalance()
          }}
        />
      }
    />
  )
}

const meta: Meta<typeof LargeTokenInput> = {
  title: 'UI Kit/Widgets/LargeTokenInput',
  component: LargeTokenInput,
  argTypes: {
    walletBalance: {
      control: 'object',
      description: 'Configuration for wallet balance, token symbol, and display options',
    },
    maxBalance: {
      control: 'object',
      description: 'Configuration for max balance behavior, including slider and chips',
    },
    message: {
      control: 'object',
      description: 'Optional message to display below the input (can be a React node)',
    },
    label: {
      control: 'text',
      description: 'Optional label explaining what the input is all about',
    },
    isError: {
      control: 'boolean',
      description: 'Whether to display the input in an error state',
    },
    tokenSelector: {
      control: 'object',
      description: 'React component to use for token selection',
    },
    inputBalanceUsd: {
      control: 'number',
      description: 'Optional dollar value of the given input balance',
    },
    children: {
      control: 'object',
      description: 'Optional children to be rendered below the input',
    },
  },
  args: {
    walletBalance: TOKEN_OPTIONS[0].walletBalance,
    maxBalance: DEFAULT_MAX_BALANCE,
    message: 'This is a helpful message',
    label: 'You pay',
    isError: false,
    inputBalanceUsd: '1337',
    onBalance: fn(),
  },
}

type Story = StoryObj<typeof LargeTokenInput>

export const Default: Story = {
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'Large token input component for token selection and amount input',
        story: 'Large token input with all bells and whistles enabled',
      },
    },
  },
}

export const WithoutWalletBalance: Story = {
  args: {
    walletBalance: undefined,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input without a wallet balance',
      },
    },
  },
}

export const WithoutMaxBalanceSlider: Story = {
  args: {
    maxBalance: {
      ...DEFAULT_MAX_BALANCE,
      showSlider: false,
    },
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input without the max balance percentage slider',
      },
    },
  },
}

export const WithChipsCustom: Story = {
  args: {
    maxBalance: {
      ...DEFAULT_MAX_BALANCE,
      chips: [{ label: 'Yolo', newBalance: () => '1337.42' }],
    },
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input with a custom input chip',
      },
    },
  },
}

export const WithoutMessage: Story = {
  args: {
    message: undefined,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input without an informational message',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    message: 'This is an error message',
    isError: true,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input in an error state with an error message',
      },
    },
  },
}

export const WithReactNodeMessage: Story = {
  args: {
    message: (
      <Stack spacing={1}>
        <Typography variant="bodyMBold">Important Message</Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          This is some additional information about your transaction
        </Typography>
        <Typography variant="bodyXsRegular" color="textTertiary">
          Fees may apply based on network conditions
        </Typography>
      </Stack>
    ),
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input with a complex message composed of multiple typography elements',
      },
    },
  },
}

export const WithChildren: Story = {
  args: {
    children: (
      <Stack
        spacing={1}
        sx={{
          padding: 2,
          backgroundColor: (t) => t.design.Layer[2].Fill,
        }}
      >
        <Typography variant="bodyMBold">Additional Content</Typography>
        <Typography variant="bodySRegular" color="textSecondary">
          The children prop allows you to render custom content below the input. This can be useful for displaying
          additional information, actions, or any other custom UI elements.
        </Typography>
      </Stack>
    ),
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large token input with custom children content rendered below the input',
      },
    },
  },
}

export default meta
