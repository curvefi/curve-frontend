import type { Meta, StoryObj } from '@storybook/react'
import { shortenAddress } from '@ui-kit/utils'
import ActionInfo from '../ActionInfo'

const meta: Meta<typeof ActionInfo> = {
  title: 'UI Kit/Widgets/ActionInfo',
  component: ActionInfo,
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed on the left side',
    },
    value: {
      control: 'text',
      description: 'Primary value to display and copy',
    },
    prevValue: {
      control: 'text',
      description: 'Previous value (if needed for comparison)',
    },
    link: {
      control: 'text',
      description: 'The URL to navigate to when clicking the external link button',
    },
    copy: {
      control: 'boolean',
      description: 'Whether or not the value can be copied',
    },
    copiedTitle: {
      control: 'text',
      description: 'Message title displayed in the snackbar when the value is copied',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the component',
    },
  },
  args: {
    label: 'Contract',
    value: shortenAddress('0x0655977feb2f289a4ab78af67bab0d17aab84367'),
    link: 'https://etherscan.io/address/0x0655977feb2f289a4ab78af67bab0d17aab84367',
    copy: true,
    copiedTitle: 'Contract address copied!',
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

export const WithPreviousValue: Story = {
  args: {
    prevValue: shortenAddress('0x1234567890123456789012345678901234567890'),
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows comparison between previous and current values',
      },
    },
  },
}

export default meta
