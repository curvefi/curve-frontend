import { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { fromEntries, mapRecord } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ, q } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'
import { type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

type Story = StoryObj<typeof meta>

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  queries: givenRoutes,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps & { isLoading?: boolean }) => {
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
        queries={useMemo(
          () => (isLoading ? mapRecord(routes, (_, route) => ({ ...route, isLoading: true })) : routes),
          [isLoading, routes],
        )}
        selectedRoute={selectedRoute}
        onChange={useCallback(route => setSelectedRoute(route), [])}
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

const meta: Meta<typeof RouteProviderStory> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProviderStory,
  args: {
    queries: fromEntries(
      RouteProviders.map(router => [
        router,
        q({ data: mockRoutes.find(route => route.router === router) ?? null, isLoading: false, error: null }),
      ]),
    ),
    selectedRoute: mockRoutes[0],
    tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: constQ(1) },
    isExpanded: false,
    onChange: () => undefined,
    onToggle: () => undefined,
    onRefresh: () => undefined,
  },
}

export default meta

export const Collapsed: Story = {}

export const Expanded: Story = {
  args: { isExpanded: true },
}

export const Loading: Story = {
  args: { isLoading: true },
}
