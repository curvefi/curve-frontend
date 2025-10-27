import { useState } from 'react'
import { fn } from 'storybook/test'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { decimal, type Decimal } from '@ui-kit/utils'
import { SliderInput } from '../SliderInput'

const SliderInputComponent = (props: React.ComponentProps<typeof SliderInput>) => {
  return (
    <Box sx={{ width: '400px' }}>
      <SliderInput {...props} />
    </Box>
  )
}

const meta: Meta<typeof SliderInput> = {
  title: 'UI Kit/Widgets/SliderInput',
  component: SliderInputComponent,
  args: {
    layoutDirection: 'row',
    size: 'medium',
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

export const MediumSize: Story = {
  args: {
    size: 'medium',
  },
}
export default meta
