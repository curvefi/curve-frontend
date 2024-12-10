import Alert from '@mui/material/Alert'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Alert> = {
  title: 'UI Kit/Primitives/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined', undefined],
      description: 'The variant of the component',
    },
    severity: {
      control: 'select',
      options: ['success', 'info', 'warning', 'error', undefined],
      description: 'The severity of the component',
    },
    children: {
      control: 'text',
      description: 'The label of the component',
    },
  },
  args: {
    variant: 'filled',
  },
}

type Story = StoryObj<typeof Alert>

export const Success: Story = {
  args: {
    severity: 'success',
    children: 'A success text message is displayed. A little llama is happy.',
  },
}

export const Info: Story = {
  args: {
    severity: 'info',
    children: 'An info text message is displayed. A little llama is curious.',
  },
}

export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'A warning text message is displayed. A little llama is cautious.',
  },
}

export const Error: Story = {
  args: {
    severity: 'error',
    children: 'An error text message is displayed. A little llama is very sad.',
  },
}

export default meta
