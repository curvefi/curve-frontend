import { fn } from 'storybook/test'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react-vite'
import { Banner, type BannerProps } from '../Banner'
import { StackBanners } from '../StackBanners'

const SEVERITIES: NonNullable<BannerProps['severity']>[] = ['alert', 'warning', 'caution', 'highlight', 'info']

const meta: Meta<typeof Banner> = {
  title: 'EVM UI/Shared UI/Banner',
  component: props => (
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
      options: ['alert', 'warning', 'caution', 'info', 'highlight'],
      description: 'The severity level of the banner message',
    },
    learnMoreUrl: {
      control: 'text',
      description: 'The URL to navigate to when clicking the learn more button',
    },
    buttonText: {
      control: 'text',
      description: 'Text for the action button (optional)',
    },
    icon: {
      control: 'select',
      options: ['llama', 'info', 'highlight', 'warning', 'caution', 'alert'],
      description: 'The icon to display before the title',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle for the banner message (optional)',
    },
  },
}

export default meta
type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    severity: 'info',
    children: 'This is a default message',
    subtitle: 'This is a subtitle for the default message',
  },
}
export const Highlight: Story = {
  args: {
    severity: 'highlight',
    children: 'This is a highlight message',
    subtitle: 'This is a subtitle for the highlight message',
  },
}
export const Warning: Story = {
  args: {
    severity: 'warning',
    children: 'This is a warning message',
    subtitle: 'This is a subtitle for the warning message',
  },
}
export const Caution: Story = {
  args: {
    severity: 'caution',
    children: 'This is a caution message',
    subtitle: 'This is a subtitle for the caution message',
  },
}
export const Error: Story = {
  args: {
    severity: 'alert',
    children: 'This is an alert message',
    subtitle: 'This is a subtitle for the alert message',
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
export const WithLearnMoreUrl: Story = {
  args: {
    severity: 'alert',
    children: 'This is an error message with a learn more URL',
    learnMoreUrl: 'https://www.curve.finance',
  },
}

export const WithCustomIcon: Story = {
  args: {
    buttonText: 'Disable Beta Mode',
    children: 'BETA MODE ENABLED',
    icon: 'llama',
  },
}

export const MaintenanceExample: Story = {
  args: {
    severity: 'warning',
    children: 'Scheduled maintenance in progress. Some features may be temporarily unavailable.',
  },
}
export const LongErrorExample: Story = {
  args: {
    severity: 'alert',
    children:
      'There is an issue connecting to the API. Please try to switch your RPC in your wallet settings. There is an issue connecting to the API. Please try to switch your RPC in your wallet settings.',
  },
}

export const GroupedAndSorted: Story = {
  render: () => (
    <Box sx={{ minWidth: 600 }}>
      <StackBanners>
        {SEVERITIES.flatMap(severity => [
          <Banner key={`${severity}-non`} severity={severity} subtitle="This banner is not removable">
            {severity} banner
          </Banner>,
          <Banner key={`${severity}-rem`} severity={severity} onClick={fn()} subtitle="This banner is removable">
            {severity} banner
          </Banner>,
        ])}
      </StackBanners>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'This story demonstrates how the StackBanners component groups and sorts banners by removable and severity.',
      },
    },
  },
}

export const FigmaVariants: Story = {
  render: () => (
    <Stack spacing={4} sx={{ minWidth: 600 }}>
      {SEVERITIES.map(severity => (
        <Banner
          key={severity}
          severity={severity}
          learnMoreUrl="https://www.curve.finance"
          onClick={fn()}
          subtitle="Notification subtitle"
        >
          Notification title
        </Banner>
      ))}
    </Stack>
  ),
}
