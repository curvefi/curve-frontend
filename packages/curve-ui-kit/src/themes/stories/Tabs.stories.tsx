import { ComponentProps, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TabsSwitcher, type TabOption } from '../../shared/ui/TabsSwitcher'
import { Stack } from '@mui/material'

type Tab = `${number}`
const tabs: TabOption<Tab>[] = [
  { value: '1' as const, label: 'Tab One' },
  { value: '2' as const, label: 'Tab Two' },
  { value: '3' as const, label: 'Tab Three' },
  { value: '4' as const, label: 'Tab Four' },
  { value: '5' as const, label: 'Tab Five' },
  { value: '6' as const, label: 'Tab Six' },
  { value: '7' as const, label: 'Tab Seven' },
  { value: '8' as const, label: 'Tab Eight' },
]

const TabsSwitcherComponent = (props: ComponentProps<typeof TabsSwitcher> & { maxNbTabs?: number }) => {
  const { maxNbTabs = 4, ...rest } = props
  const [value, setValue] = useState<Tab>(tabs[0].value)

  return <TabsSwitcher {...rest} options={tabs.slice(0, maxNbTabs)} value={value} onChange={setValue} />
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
    muiVariant: {
      control: 'select',
      options: ['standard', 'scrollable', 'fullWidth'],
      description: 'The MUI variant of the component',
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

export const ContainedScrollableTabs: Story = {
  args: {
    variant: 'contained',
    muiVariant: 'scrollable',
  },
  render: (args) => (
    <Stack sx={{ maxWidth: '24rem' }}>
      <TabsSwitcherComponent {...args} maxNbTabs={8} />
    </Stack>
  ),
}

export const UnderlinedScrollableTabs: Story = {
  args: {
    variant: 'underlined',
    muiVariant: 'scrollable',
  },
  render: (args) => (
    <Stack sx={{ maxWidth: '24rem' }}>
      <TabsSwitcherComponent {...args} maxNbTabs={8} />
    </Stack>
  ),
}

export default meta
