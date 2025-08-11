import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TabsSwitcher } from '../../shared/ui/TabsSwitcher'

const TABS = [
  { value: '1', label: 'Tab One', href: '' },
  { value: '2', label: 'Tab Two', href: '' },
  { value: '3', label: 'Tab Three', href: '' },
  { value: '4', label: 'Tab Four', href: '' },
] as const
type Tab = (typeof TABS)[number]['value']

const TabsSwitcherComponent = (props: React.ComponentProps<typeof TabsSwitcher>) => {
  const [value, setValue] = useState<Tab>(TABS[0].value)

  return <TabsSwitcher {...props} options={TABS} value={value} onChange={setValue} />
}

const meta: Meta<typeof TabsSwitcher> = {
  title: 'UI Kit/Primitives/Tabs',
  component: TabsSwitcherComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'underlined', 'overlined'],
      description: 'The variant of the component',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the component',
    },
  },
  args: {
    variant: 'contained',
    size: 'small',
  },
}

type Story = StoryObj<typeof TabsSwitcher>

export const Default: Story = {
  render: (args) => <TabsSwitcherComponent {...args} />,
}

export const NoInactiveBorders: Story = {
  args: {
    variant: 'underlined',
    hideInactiveBorders: true,
  },
  render: (args) => <TabsSwitcherComponent {...args} />,
}

export default meta
