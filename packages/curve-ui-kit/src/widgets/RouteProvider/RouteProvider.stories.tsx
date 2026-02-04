import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Address, CRVUSD_ADDRESS } from '@ui-kit/utils'
import { type RouteOption, type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

const outputTokenAddress = CRVUSD_ADDRESS as Address

const labels = {
  [outputTokenAddress]: 'crvUSD',
} satisfies Record<Address, string>

const mockRoutes: RouteOption[] = [
  { provider: 'curve', toAmountOutput: '69.4241' },
  { provider: 'enso', toAmountOutput: '67.7432' },
  { provider: 'odos', toAmountOutput: '67.0142' },
]

const meta: Meta<typeof RouteProvidersAccordion> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProvidersAccordion,
  args: {
    routes: mockRoutes,
    selectedRoute: mockRoutes[0],
    outputTokenAddress,
    tokenSymbols: labels,
    usdPrice: 1.0,
    isExpanded: false,
    isLoading: false,
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
