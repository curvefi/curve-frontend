import type { Meta, StoryObj } from '@storybook/react-vite'
import { MaintenancePage } from './MaintenancePage'

const meta: Meta<typeof MaintenancePage> = {
  title: 'UI Kit/Features/MaintenancePage',
  component: MaintenancePage,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
