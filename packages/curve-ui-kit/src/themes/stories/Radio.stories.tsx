import { useState, useEffect } from 'react'
import { fn } from 'storybook/test'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio, { RadioProps } from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import type { Meta, StoryObj } from '@storybook/react-vite'

const RadioStory = ({ checked, onChange, ...props }: RadioProps) => {
  const [value, setValue] = useState(checked ? 'option1' : 'option2')

  // Update internal state when the checked prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(checked ? 'option1' : 'option2')
  }, [checked])

  return (
    <FormControl>
      <RadioGroup
        value={value}
        onChange={(event) => {
          const newValue = event.target.value
          setValue(newValue)
          const isChecked = newValue === 'option1'
          onChange?.(event as React.ChangeEvent<HTMLInputElement>, isChecked)
        }}
      >
        <FormControlLabel
          value="option1"
          control={<Radio {...props} checked={value === 'option1'} />}
          label="Option 1"
        />
        <FormControlLabel
          value="option2"
          control={<Radio {...props} checked={value === 'option2'} />}
          label="Option 2"
        />
      </RadioGroup>
    </FormControl>
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
