import Switch, { SwitchProps } from '@mui/material/Switch'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useState } from 'react'

const SwitchStory = ({ checked, onChange, ...props }: SwitchProps) => {
  const [isChecked, setIsChecked] = useState(checked)
  return (
    <Switch
      {...props}
      checked={isChecked}
      onChange={(item, value) => {
        setIsChecked(value)
        onChange?.(item, value)
      }}
    />
  )
}

const meta: Meta<typeof Switch> = {
  title: 'UI Kit/Primitives/Switch',
  component: SwitchStory,
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning', 'default'],
      description: 'The color of the component',
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
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

type Story = StoryObj<typeof Switch>

export const PrimarySmall: Story = { args: { color: 'primary', size: 'small' } }
export const SecondaryMedium: Story = { args: { color: 'secondary', size: 'medium' } }
export const ErrorSmall: Story = { args: { color: 'error', size: 'small', checked: false } }
export const InfoMedium: Story = { args: { color: 'info', size: 'medium', checked: false } }

export default meta
