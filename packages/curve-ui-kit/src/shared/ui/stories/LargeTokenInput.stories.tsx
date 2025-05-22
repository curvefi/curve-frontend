import { useState } from 'react'
import { Select, MenuItem, Typography, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { LargeTokenInput } from '../LargeTokenInput'

const TOKEN_OPTIONS = [
  { name: 'Inferium', symbol: 'ETH', balance: 1000 },
  { name: 'Bitcorn', symbol: 'BTC', balance: 2500 },
  { name: 'The Ripple', symbol: 'RPL', balance: 5000 },
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

  const maxBalance =
    props.maxBalance === undefined
      ? undefined
      : {
          balance: tokenInfo.balance,
          symbol: tokenInfo.symbol,
          notionalValue: tokenInfo.balance * 2, // Mock USD value
          showBalance: props.maxBalance.showBalance,
          showSlider: props.maxBalance.showSlider,
        }

  return (
    <LargeTokenInput
      {...props}
      maxBalance={maxBalance}
      tokenSelector={
        <Stack>
          <Typography variant="bodyXsRegular" color="textTertiary">
            You pay
          </Typography>

          <TokenSelector onTokenChange={setTokenInfo} />
        </Stack>
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
    isError: {
      control: 'boolean',
      description: 'Whether to display the input in an error state',
    },
    tokenSelector: {
      control: 'object',
      description: 'React component to use for token selection',
    },
  },
  args: {
    maxBalance: {
      showBalance: true,
      showSlider: true,
    },
    message: '',
    isError: false,
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

export const WithoutSlider: Story = {
  args: {
    maxBalance: {
      symbol: 'ETH',
      showBalance: true,
      showSlider: false,
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

export const WithoutBalance: Story = {
  args: {
    maxBalance: {
      showBalance: false,
      showSlider: true,
    },
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

export default meta
