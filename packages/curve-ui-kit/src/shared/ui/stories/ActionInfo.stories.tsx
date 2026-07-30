import type { ComponentProps, ReactNode } from 'react'
import AcUnitIcon from '@mui/icons-material/AcUnit'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import { Stack } from '@mui/material'
import Switch from '@mui/material/Switch'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { t } from '@ui-kit/lib/i18n'
import { q } from '@ui-kit/types/util'
import { shortenAddress } from '@ui-kit/utils'
import { ActionInfo } from '../ActionInfo'
import { ActionInfoSize } from '../ActionInfo/ActionInfo'
import { ExternalLink } from '../ExternalLink'

const SIZES: ActionInfoSize[] = ['small', 'medium']

type ActionInfoStoryArgs = Omit<ComponentProps<typeof ActionInfo>, 'value' | 'prevValue'> & {
  value?: ReactNode
  prevValue?: ReactNode
  loading?: boolean
  errorMessage?: string
}

const ActionInfoStory = ({ loading, errorMessage, value, ...args }: ActionInfoStoryArgs) => (
  <ActionInfo
    {...args}
    value={
      loading || errorMessage
        ? q({ data: value, isLoading: !!loading, error: errorMessage ? new Error(errorMessage) : null })
        : value
    }
  />
)

const meta: Meta<typeof ActionInfoStory> = {
  title: 'UI Kit/Widgets/ActionInfo',
  component: ActionInfoStory,
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
    futureValue: {
      control: 'object',
      description: 'Expected value after the action',
    },
    currentValueColor: {
      control: 'color',
      description: 'Custom color for the current value text',
    },
    copyValue: {
      control: 'text',
      description: 'The value to be copied when clicking the value',
    },
    size: {
      control: 'select',
      options: SIZES,
      description: 'The size of the component',
    },
    skeleton: {
      control: 'text',
      description: 'Skeleton dimensions or representative value used to infer its dimensions',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the component is in a loading state',
    },
    errorMessage: {
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
    loading: false,
    errorMessage: '',
  },
}

type Story = StoryObj<typeof ActionInfoStory>

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
    value: '234.56',
    futureValue: '1,234.56',
    copyValue: '1,234.56',
    valueRight: 'crvUSD',
    size: 'small',
  },
  render: args => (
    <Stack sx={{ gap: 4, width: '25rem', alignItems: 'stretch' }}>
      {SIZES.map(size => (
        <ActionInfoStory
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

export const WithCurrentAndFutureValue: Story = {
  args: {
    value: shortenAddress('0x1234567890123456789012345678901234567890'),
    futureValue: shortenAddress('0x0655977feb2f289a4ab78af67bab0d17aab84367'),
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows comparison between current and expected values',
      },
    },
  },
}

export const CustomColors: Story = {
  args: {
    value: shortenAddress('0x1234567890123456789012345678901234567890'),
    currentValueColor: 'error.main',
    futureValue: shortenAddress('0x0655977feb2f289a4ab78af67bab0d17aab84367'),
    valueColor: 'success.main',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows custom colors for both current and expected values',
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
    value: shortenAddress('0x1234567890123456789012345678901234567890'),
    loading: true,
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
    errorMessage: 'Failed to load contract address',
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
