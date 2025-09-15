import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TabsSwitcher, type TabOption } from '../../shared/ui/TabsSwitcher'

type Tab = '1' | '2' | '3' | '4'
const tabs: TabOption<Tab>[] = [
  { value: '1' as const, label: 'Tab One' },
  { value: '2' as const, label: 'Tab Two' },
  { value: '3' as const, label: 'Tab Three' },
  { value: '4' as const, label: 'Tab Four' },
]

const TabsSwitcherComponent = (props: React.ComponentProps<typeof TabsSwitcher>) => {
  const [value, setValue] = useState<Tab>(tabs[0].value)

  return <TabsSwitcher {...props} options={tabs} value={value} onChange={setValue} />
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
