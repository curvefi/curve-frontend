import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { ButtonMenu } from '../ButtonMenu'

const ButtonMenuWrapper = <T extends string>(args: Parameters<typeof ButtonMenu<T>>[0]) => {
  const [open, setOpen] = useState(false)

  return <ButtonMenu {...args} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
}

const meta: Meta<typeof ButtonMenu> = {
  title: 'UI Kit/Widgets/ButtonMenu',
  component: ButtonMenu,
  render: ButtonMenuWrapper,
  argTypes: {
    primary: {
      control: 'text',
      description: 'The primary button label',
    },
    options: {
      control: 'object',
      description: 'Array of menu options',
    },
    open: {
      control: 'boolean',
      description: 'Controls menu open state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the entire button menu',
    },
    executing: {
      control: 'select',
      options: [false, 'primary'],
      description: 'Shows loading state - false, "primary", or option id',
    },
    onPrimary: {
      action: 'onPrimary',
      description: 'Callback when primary button is clicked',
    },
    onOption: {
      action: 'onOption',
      description: 'Callback when menu option is clicked',
    },
    onOpen: {
      action: 'onOpen',
      description: 'Callback when menu opens',
    },
    onClose: {
      action: 'onClose',
      description: 'Callback when menu closes',
    },
  },
  args: {
    primary: 'Repay debt & increase health',
    options: [
      { id: 'repay-partial', label: 'Repay partial debt' },
      { id: 'repay-full', label: 'Repay full debt' },
      { id: 'increase-collateral', label: 'Add more collateral' },
    ],
    open: false,
    disabled: false,
    executing: false,
    onPrimary: fn(),
    onOption: fn(),
    onOpen: fn(),
    onClose: fn(),
  },
}

type Story = StoryObj<typeof ButtonMenu>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'ButtonMenu',
        story: 'Button with dropdown menu for additional options',
      },
    },
  },
}

export const NoOptions: Story = {
  args: {
    options: [],
  },
}

export const SingleOption: Story = {
  args: {
    options: [{ id: 'single', label: 'Single Option' }],
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const ExecutingPrimary: Story = {
  args: {
    executing: 'primary',
  },
}

export const ExecutingOption: Story = {
  args: {
    executing: 'increase-collateral',
  },
}

export const ManyOptions: Story = {
  args: {
    options: [
      { id: 'opt1', label: 'First Option' },
      { id: 'opt2', label: 'Second Option' },
      { id: 'opt3', label: 'Third Option' },
      { id: 'opt4', label: 'Fourth Option' },
      { id: 'opt5', label: 'Fifth Option' },
    ],
  },
}

export const LongLabels: Story = {
  args: {
    primary: "Very Long Label That Doesn't Wrap",
    options: [
      { id: 'long1', label: 'This is a very long option label that should not wrap' },
      { id: 'long2', label: 'Another extremely long option label that should not wrap either' },
    ],
  },
}

export default meta
