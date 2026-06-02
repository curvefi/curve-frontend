import AcUnitIcon from '@mui/icons-material/AcUnit'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Stack } from '@mui/material'
import Switch from '@mui/material/Switch'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'
import { ActionInfo } from '../ActionInfo'
import { ActionInfoSize } from '../ActionInfo/ActionInfo'
import { ExternalLink } from '../ExternalLink'

const SIZES: ActionInfoSize[] = ['small', 'medium']

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
    copyValue: {
      control: 'text',
      description: 'The value to be copied when clicking the value',
    },
    copiedTitle: {
      control: 'text',
      description: 'Message title displayed in the snackbar when the value is copied',
    },
    size: {
      control: 'select',
      options: SIZES,
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
    valueTooltip: (
      <ExternalLink
        href="https://etherscan.io/address/0x0655977feb2f289a4ab78af67bab0d17aab84367"
        label={t`View on Etherscan`}
      />
    ),
    copyValue: '',
    copiedTitle: 'Contract address copied!',
    loading: false,
  },
}

type Story = StoryObj<typeof ActionInfo>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'ActionInfo displays an address with copy and external link functionality',
        story: 'Default view with medium size',
      },
    },
  },
}

export const AllSizes: Story = {
  args: {
    label: 'Collateral',
    value: '1,234.56',
    prevValue: '234.56',
    copyValue: '1,234.56',
    valueRight: 'crvUSD',
    size: 'small',
  },
  render: args => (
    <Stack sx={{ gap: 4, width: '25rem', alignItems: 'stretch' }}>
      {SIZES.map(size => (
        <ActionInfo
          key={size}
          {...args}
          valueLeft={<WhatshotIcon fontSize={size === 'small' ? 'small' : 'medium'} color="error" />}
          size={size}
        />
      ))}
    </Stack>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows all sizes of the component',
      },
    },
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

export const WithLinkTooltip: Story = {
  args: {
    value: shortenAddress('0x0655977feb2f289a4ab78af67bab0d17aab84367'),
    valueTooltip: (
      <ExternalLink
        href="https://etherscan.io/address/0x0655977feb2f289a4ab78af67bab0d17aab84367"
        label={t`View on Etherscan`}
      />
    ),
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows value tooltip content with a single link button',
      },
    },
  },
}

export const WithEmptyValueAndSwitch: Story = {
  args: {
    label: 'Toggle Setting',
    value: '',
    valueRight: <Switch size="small" />,
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
