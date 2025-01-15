/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'storybook/internal/preview-api' // Intentionally, can't use React's useState: https://github.com/storybookjs/storybook/issues/29189
import { Tabs } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { TabsSwitcher } from '../../shared/ui/TabsSwitcher'

type Story = StoryObj<typeof Tabs>

const meta: Meta<typeof TabsSwitcher> = {
  title: 'UI Kit/Primitives/Tabs',
  component: TabsSwitcher,
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

export const Contained: Story = {
  render: (args) => {
    const [value, setValue] = useState<number>(1)

    return (
      <TabsSwitcher
        options={[1, 2, 3, 4].map((value) => ({ label: `Tab ${value}`, value }))}
        value={value}
        onChange={setValue}
        {...args}
      />
    )
  },
}

export default meta
