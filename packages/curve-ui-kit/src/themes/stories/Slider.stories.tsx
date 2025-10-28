import { ComponentProps } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from '@ui-kit/shared/ui/Slider'

const SliderStory = (props: ComponentProps<typeof Slider>) => {
  const { orientation = 'horizontal', ...sliderProps } = props
  const containerWidth = 320
  return (
    <Box
      sx={{
        width: orientation === 'horizontal' ? containerWidth : 'auto',
        height: orientation === 'horizontal' ? 'auto' : containerWidth,
      }}
    >
      <Slider orientation={orientation} {...sliderProps} />
    </Box>
  )
}

const meta: Meta<typeof Slider> = {
  title: 'UI Kit/Primitives/Slider',
  component: SliderStory,
  args: {
    'data-rail-background': 'default',
    size: 'medium',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
    orientation: 'horizontal',
  },
  argTypes: {
    'data-rail-background': {
      control: 'select',
      options: ['default', 'filled', 'bordered', 'safe', 'danger'],
      description: 'Background pattern applied to the rail background.',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
      description: 'Slider height and thumb sizing.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable user interaction.',
    },
    min: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the slider.',
    },
  },
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof Slider>

export const Default: Story = {}

export const RailBackgroundFilled: Story = {
  args: {
    'data-rail-background': 'filled',
    defaultValue: 40,
  },
}

export const RailBackgroundBordered: Story = {
  args: {
    'data-rail-background': 'bordered',
    defaultValue: 40,
  },
}
export const RailBackgroundSafe: Story = {
  args: {
    'data-rail-background': 'safe',
    defaultValue: 15,
  },
}
export const RailBackgroundDanger: Story = {
  args: {
    'data-rail-background': 'danger',
    defaultValue: 15,
  },
}
export const SmallSize: Story = {
  args: {
    size: 'small',
    defaultValue: 40,
  },
}
export const DisabledDefault: Story = {
  args: {
    disabled: true,
    defaultValue: 60,
  },
}
export const DisabledSafeRail: Story = {
  args: {
    disabled: true,
    'data-rail-background': 'safe',
    defaultValue: 60,
  },
}
export const DisabledBorderedRail: Story = {
  args: {
    disabled: true,
    'data-rail-background': 'bordered',
    defaultValue: 60,
  },
}
export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    'data-rail-background': 'default',
  },
}
export const RangeFilled: Story = {
  args: {
    defaultValue: [25, 75],
    'data-rail-background': 'filled',
  },
}
export const ValueLabelDisplay: Story = {
  args: {
    valueLabelDisplay: 'auto',
    'data-rail-background': 'default',
  },
}
export const DefaultVertical: Story = {
  args: {
    'data-rail-background': 'default',
    orientation: 'vertical',
  },
}

export default meta
