import Button from '@mui/material/Button'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

const meta: Meta<typeof Button> = {
  title: 'UI Kit/Primitives/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'contained', 'outlined', undefined],
      description: 'The variant of the component',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'outlined', 'ghost', 'navigation', undefined],
      description: 'The color of the component',
    },
    children: {
      control: 'text',
      description: 'The label of the component',
    },
    size: {
      control: 'select',
      options: ['extraSmall', 'small', 'medium', 'large'],
      description: 'The size of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'The disabled state of the component',
    },
  },
  args: {
    size: 'medium',
    disabled: false,
    onClick: fn(),
  },
}

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        component: 'Primary button component',
        story: 'Primary button with label',
      },
    },
  },
  args: {
    color: 'primary',
    children: 'Primary',
  },
}
export const Secondary: Story = {
  args: {
    color: 'secondary',
    children: 'Secondary',
  },
}

export const Outlined: Story = {
  args: {
    color: undefined,
    children: 'Outlined',
  },
}

export const Ghost: Story = {
  args: {
    color: 'ghost',
    children: 'Ghost',
  },
}

export const Success: Story = {
  args: {
    color: 'success',
    children: 'Success',
  },
}

export const Error: Story = {
  args: {
    color: 'error',
    children: 'Error',
  },
}

export const Navigation: Story = {
  args: {
    color: 'navigation',
    children: 'Navigation',
  },
}

export default meta
