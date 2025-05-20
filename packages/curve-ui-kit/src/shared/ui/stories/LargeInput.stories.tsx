import { useState } from 'react'
import { Select, MenuItem, Typography, Stack } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { LargeInput } from '../LargeInput'

type TokenSelectorProps = {
  onTokenChange: (balance: number) => void
}

const TokenSelector = ({ onTokenChange }: TokenSelectorProps) => {
  const options = [
    { name: 'Inferium', balance: 1000 },
    { name: 'Bitcorn', balance: 2500 },
    { name: 'The Ripple', balance: 5000 },
  ]

  const [value, setValue] = useState(options[0].name)

  return (
    <Select
      value={value}
      onChange={(e) => {
        const selectedToken = e.target.value
        setValue(selectedToken)
        const selectedOption = options.find((option) => option.name === selectedToken)

        if (selectedOption) {
          onTokenChange(selectedOption?.balance)
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
      {options.map((option) => (
        <MenuItem key={option.name} value={option.name}>
          {option.name}
        </MenuItem>
      ))}
    </Select>
  )
}

const LargeInputWithTokenSelector = (props: any) => {
  const [maxBalance, setMaxBalance] = useState(props.maxBalance)

  return (
    <LargeInput
      {...props}
      maxBalance={maxBalance}
      tokenSelector={
        <Stack>
          <Typography variant="bodyXsRegular" color="textTertiary">
            You pay
          </Typography>

          <TokenSelector onTokenChange={setMaxBalance} />
        </Stack>
      }
    />
  )
}

const meta: Meta<typeof LargeInput> = {
  title: 'UI Kit/Widgets/LargeInput',
  component: LargeInput,
  argTypes: {
    maxBalance: {
      control: 'number',
      description: 'Maximum balance available for the selected token',
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
    maxBalance: 1000,
    message: '',
    isError: false,
    onBalance: fn(),
  },
}

type Story = StoryObj<typeof LargeInput>

export const Default: Story = {
  render: (args) => <LargeInputWithTokenSelector {...args} />,
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
  render: (args) => <LargeInputWithTokenSelector {...args} />,
  args: {
    maxBalance: undefined,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large input without a maximum balance',
      },
    },
  },
}

export const WithMessage: Story = {
  render: (args) => <LargeInputWithTokenSelector {...args} />,
  args: {
    message: 'This is a helpful message',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large input with an informational message',
      },
    },
  },
}

export const WithError: Story = {
  render: (args) => <LargeInputWithTokenSelector {...args} />,
  args: {
    message: 'This is an error message',
    isError: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large input in an error state with an error message',
      },
    },
  },
}

export const WithMaxBalanceAndError: Story = {
  render: (args) => <LargeInputWithTokenSelector {...args} />,
  args: {
    message: 'Insufficient balance',
    isError: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large input with maximum balance and an error state',
      },
    },
  },
}

export const WithReactNodeMessage: Story = {
  render: (args) => <LargeInputWithTokenSelector {...args} />,
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
  parameters: {
    docs: {
      description: {
        story: 'Large input with a complex message composed of multiple typography elements',
      },
    },
  },
}

export default meta
