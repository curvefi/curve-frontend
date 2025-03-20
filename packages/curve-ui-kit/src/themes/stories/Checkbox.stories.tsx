import { useState, useEffect } from 'react'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

const CheckboxStory = ({ checked, onChange, ...props }: CheckboxProps) => {
  const [isChecked, setIsChecked] = useState(checked)

  // Update internal state when the checked prop changes
  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  return (
    <Checkbox
      {...props}
      checked={isChecked}
      onChange={(event, value) => {
        setIsChecked(value)
        onChange?.(event, value)
      }}
    />
  )
}

const meta: Meta<typeof Checkbox> = {
  title: 'UI Kit/Primitives/Checkbox',
  component: CheckboxStory,
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      description: 'The color of the component',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the component',
    },
    checked: {
      control: 'boolean',
      description: 'The checked state of the component',
    },
    disabled: {
      control: 'boolean',
      description: 'The disabled state of the component',
    },
  },
  args: {
    checked: true,
    size: 'medium',
    disabled: false,
    onClick: fn(),
  },
}

type Story = StoryObj<typeof Checkbox>

export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Primary checkbox',
      },
    },
  },
}

export const Secondary: Story = {
  args: { color: 'secondary' },
  parameters: {
    docs: {
      description: {
        story: 'Secondary checkbox',
      },
    },
  },
}

export const Small: Story = {
  args: { size: 'small' },
  parameters: {
    docs: {
      description: {
        story: 'Small-sized checkbox (xs)',
      },
    },
  },
}

export const Medium: Story = {
  args: { size: 'medium' },
  parameters: {
    docs: {
      description: {
        story: 'Medium-sized checkbox (sm)',
      },
    },
  },
}

export const Large: Story = {
  args: { size: 'large' },
  parameters: {
    docs: {
      description: {
        story: 'Large-sized checkbox (md)',
      },
    },
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkbox',
      },
    },
  },
}

export const Unchecked: Story = {
  args: { checked: false },
  parameters: {
    docs: {
      description: {
        story: 'Unchecked checkbox',
      },
    },
  },
}

export default meta
