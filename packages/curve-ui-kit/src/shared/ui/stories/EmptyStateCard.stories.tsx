import { fn } from 'storybook/test'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReloadIcon } from '@ui-kit/shared/icons/ReloadIcon'
import { EmptyStateCard } from '../EmptyStateCard'

const meta: Meta<typeof EmptyStateCard> = {
  title: 'UI Kit/Widgets/EmptyStateCard',
  component: EmptyStateCard,
  render: args => <EmptyStateCard {...args} />,
  args: {
    title: 'No markets found',
    subtitle: 'Try adjusting your filters or search query.',
    button: { label: 'Reset filters', onClick: fn() },
  },
}

type Story = StoryObj<typeof EmptyStateCard>

export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    subtitle: undefined,
    button: undefined,
  },
}

export const WithSubtitle: Story = {
  args: {
    subtitle: 'Try adjusting your filters or search query.',
    button: undefined,
  },
}

export const WithButton: Story = {
  args: {
    subtitle: 'Try adjusting your filters or search query.',
    button: { label: 'Reset filters', onClick: fn() },
  },
}

export const With2Buttons: Story = {
  args: {
    subtitle: 'Try adjusting your filters or search query.',
    button: { label: 'Reset filters', onClick: fn() },
    secondaryButton: { label: 'Reload', onClick: fn(), startIcon: <ReloadIcon /> },
  },
}

export default meta
