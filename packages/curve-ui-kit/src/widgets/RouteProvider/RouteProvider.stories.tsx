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
  { provider: 'curve', toAmountOutput: '69.4241', isLoading: false },
  { provider: 'enso', toAmountOutput: '67.7432', isLoading: false },
  { provider: 'odos', toAmountOutput: '67.0142', isLoading: false },
]

const meta: Meta<typeof RouteProvidersAccordion> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProvidersAccordion,
  args: {
    routes: mockRoutes,
    outputTokenAddress,
    tokenSymbols: labels,
    usdPrice: 1.0,
    isExpanded: false,
    onRefresh: () => undefined,
  },
}

export default meta

type Story = StoryObj<typeof meta>

const RouteProviderStory = ({ isExpanded: givenExpanded, routes: givenRoutes, ...args }: RouteProviderProps) => {
  const [routes, setRoutes] = useState(givenRoutes)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRoutes(givenRoutes), [givenRoutes])
  useEffect(() => setIsExpanded(givenExpanded), [givenExpanded, setIsExpanded])

  return (
    <Box sx={{ maxWidth: MaxWidth.actionCard }}>
      <RouteProvidersAccordion
        {...args}
        routes={routes}
        onChange={useCallback((route) => setRoutes((rs) => [route, ...rs.filter((r) => r !== route)]), [])}
        isExpanded={isExpanded}
        onToggle={toggle}
        onRefresh={useCallback(() => {
          setRoutes(givenRoutes.map((route) => ({ ...route, isLoading: true })))
          const timeout = setTimeout(() => {
            setRoutes(givenRoutes)
          }, 1000)
          return () => clearTimeout(timeout)
        }, [givenRoutes])}
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
  args: { routes: mockRoutes.map((route) => ({ ...route, isLoading: true })) },
  render: (args) => <RouteProviderStory {...args} />,
}
