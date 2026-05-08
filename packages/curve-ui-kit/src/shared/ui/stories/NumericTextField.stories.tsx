import { useState } from 'react'
import { fn } from 'storybook/test'
import Grid from '@mui/material/Grid'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SizesAndSpaces } from '../../../themes/design/1_sizes_spaces'
import { NumericTextField, NumericTextFieldProps } from '../NumericTextField'

const { Spacing } = SizesAndSpaces

const sizes = ['tiny', 'small', 'medium'] satisfies NonNullable<NumericTextFieldProps['size']>[]
const variants = ['outlined', 'standard'] satisfies NonNullable<NumericTextFieldProps['variant']>[]

const NumericTextFieldWrapper = (props: NumericTextFieldProps) => {
  const [value, setValue] = useState<Decimal | undefined>(undefined)
  return (
    <NumericTextField
      {...props}
      value={value}
      onBlur={newValue => {
        setValue(newValue)
        props.onBlur?.(newValue)
      }}
    />
  )
}

const VariantStory = () => (
  <Grid
    container
    spacing={Spacing.lg.desktop}
    // different background needed because inputs have the same background of the app
    sx={{ backgroundColor: t => t.design.Layer[1].Fill, padding: Spacing.lg.desktop }}
  >
    {variants.flatMap(variant =>
      sizes.map(size => (
        <Grid key={`${variant}-${size}`} size={4}>
          <NumericTextFieldWrapper
            value="123456"
            min="0"
            placeholder="Amount"
            adornment="dollar"
            variant={variant}
            size={size}
            fullWidth
          />
        </Grid>
      )),
    )}
  </Grid>
)

const meta: Meta<typeof NumericTextField> = {
  title: 'UI Kit/Widgets/NumericTextField',
  component: NumericTextField,
  render: args => <NumericTextFieldWrapper {...args} />,
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
      options: ['outlined', 'standard'],
      description: 'Variant of the input field',
    },
    adornment: {
      control: 'select',
      options: ['dollar', 'percentage', 'bands'],
      description: 'Optional adornment displayed inside the input',
    },
  },
  args: {
    value: undefined,
    min: '0',
    max: undefined,
    variant: 'outlined',
    placeholder: 'Amount',
    onChange: fn(),
    onBlur: fn(),
  },
}

type Story = StoryObj<typeof NumericTextField>

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
    min: '10',
    max: '100',
    placeholder: 'Value (10-100)',
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
    min: undefined,
    max: undefined,
    placeholder: 'Any Number',
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

export const WithDollarAdornment: Story = {
  args: {
    value: '123456',
    placeholder: 'Amount in USD',
    adornment: 'dollar',
  },
  parameters: {
    docs: {
      description: {
        story: 'Numeric input with a start adornment for dollar values',
      },
    },
  },
}

export const WithPercentageAdornment: Story = {
  args: {
    value: '42.5',
    placeholder: 'Utilization',
    adornment: 'percentage',
  },
  parameters: {
    docs: {
      description: {
        story: 'Numeric input with an end adornment for percentage values',
      },
    },
  },
}

export const WithBandsAdornment: Story = {
  args: {
    value: '12',
    placeholder: 'Bands',
    adornment: 'bands',
  },
  parameters: {
    docs: {
      description: {
        story: 'Numeric input with the bands adornment variant',
      },
    },
  },
}

export const VariantsBySize: Story = {
  render: () => <VariantStory />,
  parameters: {
    docs: {
      description: {
        story: 'Displays all NumericTextField size and variant combinations with the dollar adornment applied.',
      },
    },
  },
}

export default meta
