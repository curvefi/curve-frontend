import { ComponentProps } from 'react'
import { useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Slider } from '@ui-kit/shared/ui/Slider'
import { geometricMap, powerMap } from '@ui-kit/utils/interpolations'
import { formatNumber } from '@ui-kit/utils/number'

const POW_MIN_VALUE = 0
// geometric function cannot divide by 0, so we use 1 as the minimum value
const GEO_MIN_VALUE = 1
const MAX_VALUE = 160000000

const SliderStory = (
  props: ComponentProps<typeof Slider> & {
    containerWidth?: number | string
    scaleType?: 'linear' | 'power' | 'geometric'
  },
) => {
  const {
    containerWidth = 320,
    orientation = 'horizontal',
    scaleType = 'linear',
    defaultValue = 40,
    ...sliderProps
  } = props
  const [value, setValue] = useState<number | number[]>(defaultValue)

  const handleChange = (_event: Event, newValue: number | number[]) => {
    setValue(newValue)
  }

  function valueLabelFormat(value: number) {
    return formatNumber(value, { abbreviate: true })
  }

  function calculateValue(value: number) {
    if (scaleType === 'power') {
      return powerMap(value, POW_MIN_VALUE, MAX_VALUE)
    } else if (scaleType === 'geometric') {
      return geometricMap(value, GEO_MIN_VALUE, MAX_VALUE)
    }
    // linear
    return value
  }

  return (
    <Box
      sx={{
        width: orientation === 'horizontal' ? containerWidth : 'auto',
        height: orientation === 'horizontal' ? 'auto' : containerWidth,
      }}
    >
      <Slider
        value={value}
        scale={calculateValue}
        onChange={handleChange}
        valueLabelFormat={valueLabelFormat}
        orientation={orientation}
        {...sliderProps}
      />
    </Box>
  )
}

const meta: Meta<typeof SliderStory> = {
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
    scaleType: 'linear',
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
    scaleType: {
      control: 'select',
      options: ['linear', 'power', 'geometric'],
      description: 'The scale type of the slider.',
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

type Story = StoryObj<typeof SliderStory>

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
export const LinearScale: Story = {
  args: {
    min: POW_MIN_VALUE,
    max: MAX_VALUE,
    step: 0.001,
    defaultValue: MAX_VALUE / 2,
    valueLabelDisplay: 'on',
    scaleType: 'linear',
    'data-rail-background': 'bordered',
  },
}
export const PowerScale: Story = {
  args: {
    min: 0,
    max: 1,
    step: 0.001,
    defaultValue: 0.5,
    valueLabelDisplay: 'on',
    scaleType: 'power',
    'data-rail-background': 'bordered',
  },
}
export const GeometricScale: Story = {
  args: {
    min: 0,
    max: 1,
    step: 0.001,
    defaultValue: 0.5,
    valueLabelDisplay: 'on',
    scaleType: 'geometric',
    'data-rail-background': 'bordered',
  },
}
export const DefaultVertical: Story = {
  args: {
    'data-rail-background': 'default',
    orientation: 'vertical',
  },
}

export default meta
