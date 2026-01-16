import { useState, useEffect, ChangeEvent } from 'react'
import { fn } from 'storybook/test'
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import type { Meta, StoryObj } from '@storybook/react-vite'

const CheckboxStory = ({ checked, onChange, ...props }: CheckboxProps) => {
  const [state, setState] = useState({
    option1: checked ?? false,
    option2: false,
  })

  // Update internal state when the checked prop changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, option1: checked ?? false }))
  }, [checked])

  const handleChange = (option: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const newState = { ...state, [option]: event.target.checked }
    setState(newState)

    if (option === 'option1') {
      onChange?.(event, event.target.checked)
    }
  }

  return (
    <FormControl component="fieldset">
      <FormGroup>
        <FormControlLabel
          control={<Checkbox {...props} checked={state.option1} onChange={handleChange('option1')} />}
          label="Option 1"
        />
        <FormControlLabel
          control={<Checkbox {...props} checked={state.option2} onChange={handleChange('option2')} />}
          label="Option 2"
        />
      </FormGroup>
    </FormControl>
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
