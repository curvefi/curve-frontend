import { useState } from 'react'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Decimal } from '@ui-kit/utils'
import { NumericTextField, NumericTextFieldProps } from '../NumericTextField'

const NumericTextFieldWrapper = (props: NumericTextFieldProps) => {
  const [value, setValue] = useState<Decimal | undefined>(undefined)
  return (
    <NumericTextField
      {...props}
      value={value}
      onBlur={(newValue) => {
        setValue(newValue)
        props.onBlur?.(newValue)
      }}
    />
  )
}

const meta: Meta<typeof NumericTextField> = {
  title: 'UI Kit/Widgets/NumericTextField',
  component: NumericTextField,
  argTypes: {
    value: {
      control: 'number',
      description: 'The numeric value of the input field',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value (default: 0)',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value (default: Infinity)',
    },
    label: {
      control: 'text',
      description: 'The label for the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input field',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    size: {
      control: 'select',
      options: ['tiny', 'small', 'medium'],
      description: 'Size of the input field',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'filled', 'standard'],
      description: 'Variant of the input field',
    },
  },
  args: {
    value: undefined,
    min: '0',
    max: undefined,
    label: 'Amount',
    onChange: fn(),
    onBlur: fn(),
  },
}

type Story = StoryObj<typeof NumericTextField>

export const Default: Story = {
  render: (args) => <NumericTextFieldWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        component: 'A numeric input field that validates and normalizes numeric input',
        story: 'Default state of the numeric text field',
      },
    },
  },
}

export const WithMinMax: Story = {
  args: {
    min: '10',
    max: '100',
    label: 'Value (10-100)',
    helperText: 'Enter a value between 10 and 100',
  },
  render: (args) => <NumericTextFieldWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Numeric input with minimum and maximum value constraints',
      },
    },
  },
}

export const NoMinimum: Story = {
  args: {
    min: undefined,
    max: undefined,
    label: 'Any Number',
    helperText: 'Enter any positive or negative number',
  },
  render: (args) => <NumericTextFieldWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Numeric input without minimum value constraint',
      },
    },
  },
}

export const Tiny: Story = {
  args: {
    size: 'tiny',
    label: 'Tiny (xxs)',
  },
}

export default meta
