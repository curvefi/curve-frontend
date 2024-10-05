import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Button } from '../Button'

const meta: Meta<typeof Button> = {
  title: 'UI Kit/Primitives/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'ghost', undefined],
      description: 'The variant of the component',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'alert', 'navigation', undefined],
      description: 'The color of the component',
    },
    label: {
      control: 'text',
      description: 'The label of the component',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
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
    variant: 'contained',
    color: 'primary',
    label: 'Primary',
  },
}
export const Secondary: Story = {
  args: {
    variant: 'contained',
    color: 'secondary',
    label: 'Secondary',
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    color: undefined,
    label: 'Outlined',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    color: undefined,
    label: 'Ghost',
  },
}

export const Success: Story = {
  args: {
    variant: 'contained',
    color: 'success',
    label: 'Success',
  },
}

export const Alert: Story = {
  args: {
    variant: 'contained',
    color: 'alert',
    label: 'Alert',
  },
}

export const Navigation: Story = {
  args: {
    variant: 'contained',
    color: 'navigation',
    label: 'Navigation',
  },
}

export default meta
