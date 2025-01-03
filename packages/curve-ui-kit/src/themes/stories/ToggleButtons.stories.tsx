import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'UI Kit/Primitives/ToggleButton',
  component: ToggleButtonGroup,
  argTypes: {
    exclusive: {
      control: 'boolean',
      description: 'If true, only allow one button to be selected',
    },
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium'],
      description: 'The size of the component',
    },
  },
  args: {
    size: 'medium',
    exclusive: true,
  },
}

type Story = StoryObj<typeof ToggleButtonGroup>

export const Group: Story = {
  render: (args) => (
    <ToggleButtonGroup {...args}>
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  ),
  args: {
    size: 'medium',
  },
}

export default meta
