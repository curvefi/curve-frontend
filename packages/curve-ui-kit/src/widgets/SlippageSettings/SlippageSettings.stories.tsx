import { ComponentProps, useState } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton/IconButton'
import { formatNumber } from '@ui/utils'
import { SlippageSettings } from './SlippageSettings'

const SlippageSettingsComponent = ({
  maxSlippage: initialMaxSlippage,
  ...props
}: ComponentProps<typeof SlippageSettings>) => {
  const [maxSlippage, setMaxSlippage] = useState(initialMaxSlippage)

  // Mock the setMaxSlippage function
  const handleSave = (newSlippage: Decimal) => {
    setMaxSlippage(newSlippage)
    console.info('Max slippage updated:', newSlippage)
  }

  return <SlippageSettings {...props} maxSlippage={maxSlippage} onSave={handleSave} />
}

const meta: Meta<typeof SlippageSettings> = {
  title: 'UI Kit/Features/SlippageSettings',
  component: SlippageSettingsComponent,
  args: {
    maxSlippage: '0.1',
    disabled: false,
  },
  argTypes: {
    maxSlippage: {
      control: 'text',
      description: 'Current max slippage value (as string)',
    },
    onSave: {
      control: false,
      description: 'Function to update max slippage value',
    },
    buttonIcon: {
      control: false,
      description: 'Custom icon for the settings button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the settings button is disabled',
    },
  },
}

type Story = StoryObj<typeof SlippageSettings>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component: 'SlippageSettings allows users to configure maximum slippage tolerance for trades',
        story: 'Default view showing slippage settings button that opens a dialog',
      },
    },
  },
}

export const CustomSlippage: Story = {
  args: {
    maxSlippage: '0.25',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slippage settings with custom initial value',
      },
    },
  },
}

export const WithHigherSlippage: Story = {
  args: {
    maxSlippage: '0.5',
  },
  parameters: {
    docs: {
      description: {
        story: 'Slippage settings with a higher initial value for crypto trades',
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Slippage settings with disabled button',
      },
    },
  },
}

export const WithCustomButton: Story = {
  args: {
    maxSlippage: '0.1',
    button: ({ onClick, maxSlippage }) => (
      <IconButton onClick={onClick}>
        {formatNumber(maxSlippage, { style: 'percent', decimals: 5, defaultValue: '-' })}{' '}
        <Icon name="Settings" size={16} />
      </IconButton>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Slippage settings with custom button as used in DetailInfoSlippageTolerance component',
      },
    },
  },
}

export default meta
