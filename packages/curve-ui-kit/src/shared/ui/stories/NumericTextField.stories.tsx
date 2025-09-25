import { type ComponentProps, useState } from 'react'
import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { type PreciseNumber, toPrecise } from '@ui-kit/utils'
import { NumericTextField } from '../NumericTextField'

const NumericTextFieldWrapper = ({
  min,
  max,
  ...props
}: Omit<ComponentProps<typeof NumericTextField>, 'min' | 'max' | 'value'> & {
  min?: number
  max?: number
}) => {
  const [value, setValue] = useState<PreciseNumber | undefined>(undefined)

  return (
    <NumericTextField
      min={toPrecise(min)}
      max={toPrecise(max)}
      {...props}
      value={value}
      onBlur={(newValue) => {
        setValue(newValue)
        props.onBlur?.(newValue)
      }}
    />
  )
}

const meta: Meta<typeof NumericTextFieldWrapper> = {
  title: 'UI Kit/Widgets/NumericTextField',
  component: NumericTextFieldWrapper,
  argTypes: {
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
    min: 0,
    max: Infinity,
    label: 'Amount',
    onChange: fn(),
    onBlur: fn(),
  },
}

type Story = StoryObj<typeof NumericTextFieldWrapper>

export const Default: Story = {
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
    min: 10,
    max: 100,
    label: 'Value (10-100)',
    helperText: 'Enter a value between 10 and 100',
  },

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
    min: -Infinity,
    max: Infinity,
    label: 'Any Number',
    helperText: 'Enter any positive or negative number',
  },

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
