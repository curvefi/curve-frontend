import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { q } from '@ui-kit/types/util'
import { type RouteOption, type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

const zeroAddress = '0x0000000000000000000000000000000000000000'

const mockRoutes: RouteOption[] = [
  {
    id: 'curve',
    router: 'curve',
    amountIn: ['69424100000000000000'],
    amountOut: ['69424100000000000000'],
    priceImpact: 0.01,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Curve', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'curve', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000001', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'enso',
    router: 'enso',
    amountIn: ['69424100000000000000'],
    amountOut: ['67743200000000000000'],
    priceImpact: 0.1,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Enso', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'enso', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000002', data: '0x', from: zeroAddress, value: '0' },
  },
  {
    id: 'odos',
    router: 'odos',
    amountIn: ['69424100000000000000'],
    amountOut: ['67014200000000000000'],
    priceImpact: 0.001,
    createdAt: 0,
    warnings: [],
    route: [
      { name: 'Odos', tokenIn: [zeroAddress], tokenOut: [zeroAddress], protocol: 'odos', action: 'swap', chainId: 1 },
    ],
    tx: { to: '0x0000000000000000000000000000000000000003', data: '0x', from: zeroAddress, value: '0' },
  },
]

const meta: Meta<typeof RouteProvidersAccordion> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProvidersAccordion,
  args: {
    data: mockRoutes,
    selectedRoute: mockRoutes[0],
    tokenOut: {
      symbol: 'crvUSD',
      decimals: 18,
      usdRate: q({ data: 1, isLoading: false, error: null }),
    },
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
