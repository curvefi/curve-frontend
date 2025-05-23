import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Banner } from '../Banner'

const meta: Meta<typeof Banner> = {
  title: 'UI Kit/Primitives/Banner',
  component: (props) => (
    <Box sx={{ minWidth: 600 }}>
      <Banner {...props} />
    </Box>
  ),
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Banner message component used to display important information with different severity levels.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    severity: {
      control: 'select',
      options: ['error', 'warning', 'info'],
      description: 'The severity level of the banner message',
    },
    buttonText: {
      control: 'text',
      description: 'Text for the action button (optional)',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
  },
}

export default meta
type Story = StoryObj<typeof Banner>

export const Error: Story = {
  args: {
    severity: 'alert',
    children: 'This is an alert message',
  },
}

export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'This is a warning message',
  },
}

export const Info: Story = {
  args: {
    severity: 'default',
    children: 'This is a default message',
  },
}

export const Highlight: Story = {
  args: {
    severity: 'highlight',
    children: 'This is a highlight message',
  },
}

export const WithButton: Story = {
  args: {
    severity: 'alert',
    children: 'This is an error message with an action button',
    buttonText: 'Dismiss',
    onClick: fn(),
  },
}

const { IconSize } = SizesAndSpaces

export const WithIcon: Story = {
  args: {
    buttonText: 'Disable Beta Mode',
    children: (
      <>
        <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> BETA MODE ENABLED
      </>
    ),
  },
}

export const NetworkSwitchExample: Story = {
  args: {
    severity: 'alert',
    buttonText: 'Change network',
    children: "Please switch your wallet's network to Ethereum to use Curve on Ethereum.",
  },
}

export const MaintenanceExample: Story = {
  args: {
    severity: 'warning',
    children: 'Scheduled maintenance in progress. Some features may be temporarily unavailable.',
  },
}

export const ApiErrorExample: Story = {
  args: {
    severity: 'alert',
    children:
      'There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet, please switch to a different one.',
  },
}
