import { useState } from 'react'
import Card from '@mui/material/Card'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SubTabsSwitcher } from '../SubTabsSwitcher'
import { TabOption } from '../Tabs/TabsSwitcher'

type TabValue = string

const DEFAULT_TABS: TabOption<TabValue>[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'details', label: 'Details' },
  { value: 'activity', label: 'Activity' },
]

const SubTabsSwitcherWrapper = ({ tabs }: { tabs: TabOption<TabValue>[] }) => {
  const [value, setValue] = useState<TabValue>(tabs[0]?.value ?? '')
  return (
    <Card sx={{ width: '800px', padding: 2 }}>
      <SubTabsSwitcher tabs={tabs} value={value} onChange={setValue} />
    </Card>
  )
}

const meta: Meta<typeof SubTabsSwitcherWrapper> = {
  title: 'UI Kit/Widgets/SubTabsSwitcher',
  component: SubTabsSwitcherWrapper,
  argTypes: {
    tabs: {
      control: 'object',
      description: 'Array of tab options with value and label',
    },
  },
  args: {
    tabs: DEFAULT_TABS,
  },
}

export default meta
type Story = StoryObj<typeof SubTabsSwitcherWrapper>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        component:
          'Sub tabs switcher meant to sit inside content with a horizontal divider line that stretches full width and aligns with TabsSwitcher of variant underlined.',
        story: 'Default sub tabs with a full-width divider line',
      },
    },
  },
}
