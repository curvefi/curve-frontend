import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type RouteOption, type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

const mockRoutes: RouteOption[] = [
  {
    id: 'curve',
    provider: 'curve',
    toAmountOutput: '69.4241',
    usdPrice: 1,
    priceImpact: 0.01,
    routerAddress: '0x0000000000000000000000000000000000000001',
    calldata: '0x',
  },
  {
    id: 'enso',
    provider: 'enso',
    toAmountOutput: '67.7432',
    usdPrice: 1,
    priceImpact: 0.1,
    routerAddress: '0x0000000000000000000000000000000000000002',
    calldata: '0x',
  },
  {
    id: 'odos',
    provider: 'odos',
    toAmountOutput: '67.0142',
    usdPrice: 1,
    priceImpact: 0.001,
    routerAddress: '0x0000000000000000000000000000000000000003',
    calldata: '0x',
  },
]

const meta: Meta<typeof RouteProvidersAccordion> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProvidersAccordion,
  args: {
    routes: mockRoutes,
    selectedRoute: mockRoutes[0],
    toTokenSymbol: 'crvUSD',
    isExpanded: false,
    isLoading: false,
    error: null,
    onRefresh: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof meta>

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  routes: givenRoutes,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps) => {
  const [routes, setRoutes] = useState(givenRoutes)
  const [selectedRoute, setSelectedRoute] = useState(givenSelectedRoute)
  const [isLoading, setIsLoading] = useState(givenIsLoading)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  /* eslint-disable react-hooks/set-state-in-effect -- Syncing Storybook controls with local state */
  useEffect(() => setRoutes(givenRoutes), [givenRoutes])
  useEffect(() => setSelectedRoute(givenSelectedRoute), [givenSelectedRoute])
  useEffect(() => setIsExpanded(givenExpanded), [givenExpanded, setIsExpanded])
  useEffect(() => setIsLoading(givenIsLoading), [givenIsLoading])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <Box sx={{ maxWidth: MaxWidth.actionCard }}>
      <RouteProvidersAccordion
        {...args}
        routes={routes}
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
  args: { routes: [mockRoutes[0]] },
  render: (args) => <RouteProviderStory {...args} />,
}

export const Loading: Story = {
  args: { isLoading: true },
  render: (args) => <RouteProviderStory {...args} />,
}
