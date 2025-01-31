import ActionInfo from '../ActionInfo'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ActionInfo> = {
  title: 'UI Kit/Widgets/ActionInfo',
  component: ActionInfo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed on the left side',
    },
    address: {
      control: 'text',
      description: 'The address to display and copy',
    },
    linkAddress: {
      control: 'text',
      description: 'The URL to navigate to when clicking the external link button',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the component',
    },
  },
  args: {
    label: 'Contract Address',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    linkAddress: 'https://etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678',
    size: 'small',
  },
}

type Story = StoryObj<typeof ActionInfo>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'ActionInfo displays an address with copy and external link functionality',
        story: 'Default view with small size',
      },
    },
  },
}

export const Medium: Story = {
  args: {
    size: 'medium',
  },
}

export const Large: Story = {
  args: {
    size: 'large',
  },
}

export const CustomLabel: Story = {
  args: {
    label: 'Pool Address',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    linkAddress: 'https://etherscan.io/address/0xabcdef1234567890abcdef1234567890abcdef12',
  },
}

export default meta
