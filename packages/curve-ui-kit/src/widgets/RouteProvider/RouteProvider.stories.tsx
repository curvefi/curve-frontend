import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'
import { type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

const meta: Meta<typeof RouteProvidersAccordion> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProvidersAccordion,
  args: {
    data: mockRoutes,
    selectedRoute: mockRoutes[0],
    tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: constQ(1) },
    isExpanded: false,
    isLoading: false,
    error: null,
    onChange: () => undefined,
    onToggle: () => undefined,
    onRefresh: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof meta>

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  data: givenRoutes,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps) => {
  const [routes, setRoutes] = useState(givenRoutes)
  const [selectedRoute, setSelectedRoute] = useState(givenSelectedRoute)
  const [isLoading, setIsLoading] = useState(givenIsLoading)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  useEffect(() => setRoutes(givenRoutes), [givenRoutes])
  useEffect(() => setSelectedRoute(givenSelectedRoute), [givenSelectedRoute])
  useEffect(() => setIsExpanded(givenExpanded), [givenExpanded, setIsExpanded])
  useEffect(() => setIsLoading(givenIsLoading), [givenIsLoading])

  return (
    <Box sx={{ maxWidth: MaxWidth.actionCard }}>
      <RouteProvidersAccordion
        {...args}
        data={routes}
        selectedRoute={selectedRoute}
        isLoading={isLoading}
        onChange={useCallback((route) => setSelectedRoute(route), [])}
        isExpanded={isExpanded}
        onToggle={toggle}
        onRefresh={useCallback(() => {
          setIsLoading(true)
          const timeout = setTimeout(() => {
            setIsLoading(false)
          }, 1000)
          return () => clearTimeout(timeout)
        }, [])}
      />
    </Box>
  )
}

export const Collapsed: Story = {
  render: (args) => <RouteProviderStory {...args} />,
}

export const Expanded: Story = {
  args: { isExpanded: true },
  render: (args) => <RouteProviderStory {...args} />,
}

export const SingleRoute: Story = {
  args: { data: [mockRoutes[0]] },
  render: (args) => <RouteProviderStory {...args} />,
}

export const Loading: Story = {
  args: { isLoading: true },
  render: (args) => <RouteProviderStory {...args} />,
}
