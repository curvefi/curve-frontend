import { useState, useEffect } from 'react'
import Radio, { RadioProps } from '@mui/material/Radio'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

const RadioStory = ({ checked, onChange, ...props }: RadioProps) => {
  const [isChecked, setIsChecked] = useState(checked)

  // Update internal state when the checked prop changes
  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  return (
    <Radio
      {...props}
      checked={isChecked}
      onChange={(event, value) => {
        setIsChecked(value)
        onChange?.(event, value)
      }}
    />
  )
}

const meta: Meta<typeof Radio> = {
  title: 'UI Kit/Primitives/Radio',
  component: RadioStory,
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

type Story = StoryObj<typeof Radio>

export const Primary: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Primary radio button',
      },
    },
  },
}

export const Secondary: Story = {
  args: { color: 'secondary' },
  parameters: {
    docs: {
      description: {
        story: 'Secondary radio button',
      },
    },
  },
}

export const Small: Story = {
  args: { size: 'small' },
  parameters: {
    docs: {
      description: {
        story: 'Small-sized radio button (xs)',
      },
    },
  },
}

export const Medium: Story = {
  args: { size: 'medium' },
  parameters: {
    docs: {
      description: {
        story: 'Medium-sized radio button (sm)',
      },
    },
  },
}

export const Large: Story = {
  args: { size: 'large' },
  parameters: {
    docs: {
      description: {
        story: 'Large-sized radio button (md)',
      },
    },
  },
}

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story: 'Disabled radio button',
      },
    },
  },
}

export const Unchecked: Story = {
  args: { checked: false },
  parameters: {
    docs: {
      description: {
        story: 'Unchecked radio button',
      },
    },
  },
}

export default meta
