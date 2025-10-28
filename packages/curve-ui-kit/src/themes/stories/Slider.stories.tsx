import { ComponentProps, useState } from 'react'
import { fn } from 'storybook/test'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CLASS_BORDERLESS } from '../components/slider'

const SliderComponent = (props: ComponentProps<typeof Slider>) => {
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
      options: ['small', 'medium'],
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
    size: 'small',
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
        story: 'Large-sized slider variant',
      },
    },
  },
}

export const RangeSlider: Story = {
  args: {
    defaultValue: [20, 80],
    valueLabelDisplay: 'auto',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Range slider with two thumbs for selecting a range of values',
      },
    },
  },
}

export const Borderless: Story = {
  args: {
    className: CLASS_BORDERLESS,
  },
  parameters: {
    docs: {
      description: {
        story: 'Slider with borderless styling',
      },
    },
  },
}

export default meta
