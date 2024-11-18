import { Stack, Tabs } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import { TabsSwitcher, TabsSwitcherProps } from '@/shared/ui/TabsSwitcher'
import { TabSwitcherVariants } from '@/themes/tabs'
import { useState } from 'react'

type Story = StoryObj<typeof Tabs>

type TabsDisplayProps = Pick<TabsSwitcherProps<number>, 'variant' | 'size' | 'options'> & {
  defaultValue: number
}

const TabsDisplay = ({ defaultValue, ...props }: TabsDisplayProps) => {
  const [value, setValue] = useState<number>(defaultValue)
  return <TabsSwitcher {...props} value={value} onChange={setValue} />
}

const createStory = (variant: TabSwitcherVariants): Story => ({
  decorators: [
    (Story, { args }) => (
      <Stack spacing={5}>
        <TabsDisplay variant={variant} {...args} />
      </Stack>
    ),
  ],
})

export const Contained = createStory('contained')
export const Underlined = createStory('underlined')
export const Overlined = createStory('overlined')

const meta: Meta<typeof TabsDisplay> = {
  title: 'UI Kit/Primitives/Tabs',
  component: TabsDisplay,
  argTypes: {},
  args: {
    options: [1, 2, 3, 4].map((value) => ({ label: `Tab ${value}`, value })),
    defaultValue: 1
  },
}
export default meta
