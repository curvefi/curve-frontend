import { useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { TradingSlider } from '../TradingSlider'

const TradingSliderComponent = (props: React.ComponentProps<typeof TradingSlider>) => {
  const [percentage, setPercentage] = useState<number>(props.percentage || 50)

  return (
    <Box sx={{ width: '400px' }}>
      <TradingSlider
        {...props}
        percentage={percentage}
        onPercentageChange={(newPercentage) => {
          setPercentage(newPercentage)
          props.onPercentageChange?.(newPercentage)
        }}
        onPercentageCommitted={(newPercentage) => {
          setPercentage(newPercentage)
          props.onPercentageCommitted?.(newPercentage)
        }}
      />
    </Box>
  )
}

const meta: Meta<typeof TradingSlider> = {
  title: 'UI Kit/Widgets/TradingSlider',
  component: TradingSliderComponent,
  argTypes: {
    percentage: {
      control: 'number',
      description: 'The current percentage value (0-100)',
    },
    step: {
      control: 'number',
      description: 'Step increment for the slider and input',
    },
    textAlign: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Text alignment for the input field',
    },
    onPercentageChange: {
      description: 'Callback when percentage changes on the slider',
    },
    onPercentageCommitted: {
      description: 'Callback when percentage changes by releasing the slider or entering a number',
    },
  },
  args: {
    percentage: 50,
    step: 1,
    textAlign: 'left',
    onPercentageChange: fn(),
    onPercentageCommitted: fn(),
  },
}

type Story = StoryObj<typeof TradingSlider>

export const Default: Story = {}

export default meta
