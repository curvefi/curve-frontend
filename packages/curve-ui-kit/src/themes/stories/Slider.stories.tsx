import { useState } from 'react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

const SliderComponent = (props: React.ComponentProps<typeof Slider>) => {
  const [value, setValue] = useState<number | number[]>(props.defaultValue as number | number[])

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '200px' }}>
      <Slider {...props} value={value} onChange={handleChange} />
    </Box>
  )
}

const meta: Meta<typeof Slider> = {
  title: 'UI Kit/Primitives/Slider',
  component: SliderComponent,
  argTypes: {
    defaultValue: {
      control: 'number',
      description: 'The default value of the slider',
    },
    min: {
      control: 'number',
      description: 'The minimum allowed value of the slider',
    },
    max: {
      control: 'number',
      description: 'The maximum allowed value of the slider',
    },
    step: {
      control: 'number',
      description: 'The step increment value',
    },
    disabled: {
      control: 'boolean',
      description: 'The disabled state of the component',
    },
    valueLabelDisplay: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      description: 'Controls when the value label is displayed',
    },
    size: {
      control: 'select',
      options: ['medium', 'large'],
      description: 'The size of the slider',
    },
  },
  args: {
    defaultValue: 50,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    valueLabelDisplay: 'off',
    onChange: fn(),
    size: 'medium',
  },
}

type Story = StoryObj<typeof Slider>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Slider component with custom styling',
        story: 'Default slider with custom track and thumb',
      },
    },
  },
}

export const WithValueLabel: Story = {
  args: {
    valueLabelDisplay: 'on',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const CustomRange: Story = {
  args: {
    min: 0,
    max: 1000,
    step: 100,
    defaultValue: 500,
  },
}

export const MediumSize: Story = {
  args: {
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium-sized slider variant (default)',
      },
    },
  },
}

export const LargeSize: Story = {
  args: {
    size: 'large',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large-sized slider variant',
      },
    },
  },
}

export const RangeSlider: Story = {
  args: {
    defaultValue: [20, 80],
    valueLabelDisplay: 'auto',
    size: 'large',
  },
  parameters: {
    docs: {
      description: {
        story: 'Range slider with two thumbs for selecting a range of values',
      },
    },
  },
}

export default meta
