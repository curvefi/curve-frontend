import AcUnitIcon from '@mui/icons-material/AcUnit'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import Switch from '@mui/material/Switch'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { shortenAddress } from '@ui-kit/utils'
import { ActionInfo } from '../ActionInfo'

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
    valueTooltip: {
      control: 'text',
      description: 'Tooltip text to display when hovering over the value',
    },
    prevValue: {
      control: 'text',
      description: 'Previous value (if needed for comparison)',
    },
    prevValueColor: {
      control: 'color',
      description: 'Custom color for the previous value text',
    },
    emptyValue: {
      control: 'text',
      description: 'Placeholder rendered when neither current nor previous value is provided',
    },
    link: {
      control: 'text',
      description: 'The URL to navigate to when clicking the external link button',
    },
    copyValue: {
      control: 'text',
      description: 'The value to be copied (will display a copy button)',
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
    loading: {
      control: 'boolean',
      description: 'Whether the component is in a loading state. Can be boolean or string.',
    },
    error: {
      control: 'text',
      description: 'Error message to display instead of the value',
    },
  },
  args: {
    label: 'Contract',
    value: shortenAddress('0x0655977feb2f289a4ab78af67bab0d17aab84367'),
    valueColor: 'textPrimary',
    valueTooltip: 'Contract address',
    link: 'https://etherscan.io/address/0x0655977feb2f289a4ab78af67bab0d17aab84367',
    copyValue: '',
    copiedTitle: 'Contract address copied!',
    size: 'small',
    loading: false,
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

export const WithTooltip: Story = {
  args: {
    value: '0x0655977feb2f289a4ab78af67bab0d17aab84367',
    valueTooltip: 'Full contract address: 0x0655977feb2f289a4ab78af67bab0d17aab84367',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows value with a tooltip that appears on hover',
      },
    },
  },
}

export const WithEmptyValueAndSwitch: Story = {
  args: {
    label: 'Toggle Setting',
    value: '',
    valueRight: <Switch size="small" />,
    link: '',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows an ActionInfo with an empty value and a MUI Switch component as valueRight',
      },
    },
  },
}

export const Loading: Story = {
  args: {
    loading: shortenAddress('0x1234567890123456789012345678901234567890'),
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a loading state with a skeleton placeholder',
      },
    },
  },
}

export const WithError: Story = {
  args: {
    error: new Error('Failed to load contract address'),
    size: 'medium',
    link: '',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component displaying an error message instead of the value',
      },
    },
  },
}

export default meta
