import { useEffect, useState, ComponentProps } from 'react'
import { fn } from 'storybook/test'
import Box from '@mui/material/Box'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { formatNumber } from '@ui-kit/utils/number'
import { DecimalRangeValue, SliderInput } from '../SliderInput'

type SliderInputStoryProps = Omit<ComponentProps<typeof SliderInput>, 'value'> & {
  value?: Decimal | DecimalRangeValue
}

const SliderInputComponent = ({ value: initialValue = '40', onChange, ...rest }: SliderInputStoryProps) => {
  const [value, setValue] = useState<Decimal | DecimalRangeValue>(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <Box sx={{ width: '400px' }}>
      <SliderInput
        {...rest}
        value={value}
        onChange={(newValue) => {
          setValue(newValue)
          onChange?.(newValue)
        }}
      />
    </Box>
  )
}

const meta: Meta<typeof SliderInputComponent> = {
  title: 'UI Kit/Widgets/SliderInput',
  component: SliderInputComponent,
  render: (args) => <SliderInputComponent {...(args as SliderInputStoryProps)} />,
  args: {
    name: 'slider-story',
    layoutDirection: 'row',
    size: 'medium',
    value: '40',
    min: 0,
    max: 100,
    step: 1,
    onChange: fn(),
  },
  argTypes: {
    layoutDirection: {
      control: 'select',
      options: ['column', 'row'],
      description:
        'The direction of the layout. Row: inputs on the left and right of the slider. Column: inputs below the slider.',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'The size of the slider and inputs.',
    },
    value: {
      control: 'object',
      description: 'Current value controlled by the slider and inputs. Use an array to enable range mode.',
    },
    min: {
      control: 'number',
      description: 'Minimum value allowed for the slider and inputs.',
    },
    max: {
      control: 'number',
      description: 'Maximum value allowed for the slider and inputs.',
    },
    step: {
      control: 'number',
      description: 'Step increment for the slider.',
    },
    inputProps: {
      control: 'object',
      description: 'Additional props forwarded to the inputs.',
    },
    onChange: {
      control: false,
      description: 'Callback triggered when the value changes.',
    },
  },
}

type Story = StoryObj<typeof SliderInput>

export const Default: Story = {}

export const ColumnLayout: Story = {
  args: {
    layoutDirection: 'column',
  },
}
export const SmallSize: Story = {
  args: {
    size: 'small',
  },
}
export const Range: Story = {
  args: {
    value: ['30', '70'],
  },
}
export const RangeColumnLayout: Story = {
  args: {
    layoutDirection: 'column',
    value: ['30', '70'],
  },
}
export const RangeColumnLayoutSmall: Story = {
  args: {
    layoutDirection: 'column',
    value: ['30', '70'],
    size: 'small',
  },
}
export const Disabled: Story = {
  args: {
    layoutDirection: 'column',
    value: ['30', '70'],
    disabled: true,
  },
}
export const TradingSlider: Story = {
  args: {
    layoutDirection: 'row',
    value: '50',
    sliderProps: {
      'data-rail-background': 'danger',
    },
    inputProps: {
      format: (value) => formatNumber(Number(value), { abbreviate: true }),
      adornment: 'percentage',
    },
  },
}

export default meta
