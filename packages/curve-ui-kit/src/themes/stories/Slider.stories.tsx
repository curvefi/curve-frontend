import Box from '@mui/material/Box'
import type { SliderProps } from '@mui/material/Slider'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from '@ui-kit/shared/ui/Slider'

type SliderValue = Exclude<SliderProps['value'], undefined>

const SlierStory = (
  props: SliderProps & {
    containerWidth?: number | string
  },
) => {
  const { containerWidth = 320, ...sliderProps } = props
  return (
    <Box sx={{ width: containerWidth }}>
      <Slider {...sliderProps} />
    </Box>
  )
}

const meta: Meta<typeof Slider> = {
  title: 'UI Kit/Primitives/Slider',
  component: SlierStory,
  args: {
    railBackground: 'default',
    size: 'medium',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 50,
  },
  argTypes: {
    railBackground: {
      control: 'select',
      options: ['default', 'bordered', 'safe', 'danger'],
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
  },
  parameters: {
    layout: 'centered',
  },
}

type Story = StoryObj<typeof Slider>

export const Default: Story = {}

export const RailBackgroundBordered: Story = {
  args: {
    railBackground: 'bordered',
  },
}

export const RailBackgroundSafe: Story = {
  args: {
    railBackground: 'safe',
  },
}

export const RailBackgroundDanger: Story = {
  args: {
    railBackground: 'danger',
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
    railBackground: 'safe',
    defaultValue: 60,
  },
}

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    railBackground: 'default',
  },
}

export const ValueLabelDisplay: Story = {
  args: {
    valueLabelDisplay: 'auto',
    railBackground: 'default',
  },
}

export default meta
