import AcUnitIcon from '@mui/icons-material/AcUnit'
import WhatshotIcon from '@mui/icons-material/Whatshot'
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
    valueColor: {
      control: 'color',
      description: 'Custom color for the value text',
    },
    valueLeft: {
      control: 'text',
      description: 'Optional content to display to the left of the value',
    },
    valueRight: {
      control: 'text',
      description: 'Optional content to display to the right of the value',
    },
    prevValue: {
      control: 'text',
      description: 'Previous value (if needed for comparison)',
    },
    prevValueColor: {
      control: 'color',
      description: 'Custom color for the previous value text',
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
    valueColor: 'textPrimary',
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

export const CustomColors: Story = {
  args: {
    valueColor: 'success.main',
    prevValue: shortenAddress('0x1234567890123456789012345678901234567890'),
    prevValueColor: 'error.main',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows custom colors for both current and previous values',
      },
    },
  },
}

export const WithValueDecorators: Story = {
  args: {
    valueLeft: <WhatshotIcon color="error" />,
    valueRight: <AcUnitIcon color="primary" />,
    value: '1,234.56',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows value with left and right decorators using MUI icons',
      },
    },
  },
}

export default meta
