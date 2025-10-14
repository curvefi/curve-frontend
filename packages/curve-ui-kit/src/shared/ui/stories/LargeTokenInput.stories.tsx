import { useRef, useState } from 'react'
import { fn } from 'storybook/test'
import { Select, MenuItem, Typography, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LargeTokenInput, type LargeTokenInputRef } from '../LargeTokenInput'

const TOKEN_OPTIONS = [
  { name: 'Inferium', symbol: 'ETH', balance: 1000 },
  { name: 'Bitcorn', symbol: 'BTC', balance: 2500 },
  { name: 'The Ripple', symbol: 'RPL', balance: 5000 },
  { name: 'Decimalator', symbol: 'DEC', balance: 69.4201337 },
]

type TokenSelectorProps = {
  onTokenChange: (tokenInfo: { balance: number; symbol: string }) => void
}

const TokenSelector = ({ onTokenChange }: TokenSelectorProps) => {
  const [value, setValue] = useState(TOKEN_OPTIONS[0].name)

  return (
    <Select
      value={value}
      onChange={(e) => {
        const selectedToken = e.target.value
        setValue(selectedToken)
        const selectedOption = TOKEN_OPTIONS.find((option) => option.name === selectedToken)

        if (selectedOption) {
          onTokenChange({
            balance: selectedOption.balance,
            symbol: selectedOption.symbol,
          })
        }
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

const LargeTokenInputWithTokenSelector = (props: any) => {
  const [tokenInfo, setTokenInfo] = useState({
    balance: TOKEN_OPTIONS[0].balance,
    symbol: TOKEN_OPTIONS[0].symbol,
  })

  const inputRef = useRef<LargeTokenInputRef>(null)

  const maxBalance =
    props.maxBalance === undefined
      ? undefined
      : {
          balance: tokenInfo.balance,
          symbol: tokenInfo.symbol,
          notionalValueUsd: tokenInfo.balance * 2, // Mock USD value
          showBalance: props.maxBalance.showBalance,
          showSlider: props.maxBalance.showSlider,
          chips: props.maxBalance.chips,
        }

  return (
    <LargeTokenInput
      {...props}
      name="amount"
      maxBalance={maxBalance}
      inputBalanceUsd={props.inputBalanceUsd}
      tokenSelector={
        <TokenSelector
          onTokenChange={(newToken) => {
            setTokenInfo(newToken)
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
    maxBalance: {
      control: 'object',
      description: 'Configuration for maximum balance, token symbol, and display options',
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
    balanceDecimals: {
      control: 'number',
      description: 'Number of decimal places to round balance values to when calculating from percentage',
    },
    inputBalanceUsd: {
      control: 'number',
      description: 'Optional dollar value of the given input balance',
    },
  },
  args: {
    maxBalance: {
      showBalance: true,
      showSlider: false,
      chips: undefined,
    },
    message: '',
    label: 'You pay',
    isError: false,
    balanceDecimals: 4,
    inputBalanceUsd: 1337,
    onBalance: fn(),
  },
}

type Story = StoryObj<typeof LargeTokenInput>

export const Default: Story = {
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'Large input component for token selection and amount input',
        story: 'Default state of the large input component',
      },
    },
  },
}

export const NoMaxBalance: Story = {
  args: {
    maxBalance: undefined,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input without a maximum balance',
      },
    },
  },
}

export const WithSlider: Story = {
  args: {
    maxBalance: {
      symbol: 'ETH',
      showBalance: true,
      showSlider: true,
    },
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input without the percentage slider',
      },
    },
  },
}

export const WithChipsRange: Story = {
  args: {
    maxBalance: {
      symbol: 'ETH',
      showBalance: true,
      chips: 'range',
    },
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input with the usual percentage chips',
      },
    },
  },
}

export const WithChipsCustom: Story = {
  args: {
    maxBalance: {
      symbol: 'ETH',
      showBalance: true,
      chips: [{ label: 'Yolo', newBalance: () => '1337.42' }],
    },
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input with a custom input chip',
      },
    },
  },
}

export const WithoutBalance: Story = {
  args: {
    maxBalance: {
      showBalance: false,
      showSlider: true,
    },
    inputBalanceUsd: undefined,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input without the balance display',
      },
    },
  },
}

export const WithMessage: Story = {
  args: {
    message: 'This is a helpful message',
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input with an informational message',
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
        story: 'Large input in an error state with an error message',
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
        story: 'Large input with a complex message composed of multiple typography elements',
      },
    },
  },
}

export const HighPrecisionDecimals: Story = {
  args: {
    balanceDecimals: 8,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input with 8 decimal places for high precision calculations',
      },
    },
  },
}

export const LowPrecisionDecimals: Story = {
  args: {
    balanceDecimals: 2,
  },
  render: (args) => <LargeTokenInputWithTokenSelector {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Large input with 2 decimal places for lower precision calculations',
      },
    },
  },
}

export default meta
