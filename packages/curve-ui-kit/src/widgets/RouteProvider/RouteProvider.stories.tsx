import { useCallback, useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import { fromEntries, mapRecord } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { BaseConfig } from '@ui/utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ, q } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'
import { type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  isFetching: givenIsFetching,
  queries: givenRoutes,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps & { isLoading?: boolean; isFetching?: boolean }) => {
  const [routes, setRoutes] = useState(givenRoutes)
  const [selectedRoute, setSelectedRoute] = useState(givenSelectedRoute)
  const [isLoading, setIsLoading] = useState(givenIsLoading ?? false)
  const [isFetching, setIsFetching] = useState(false)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  useEffect(() => setRoutes(givenRoutes), [givenRoutes])
  useEffect(() => setSelectedRoute(givenSelectedRoute), [givenSelectedRoute])
  useEffect(() => setIsExpanded(givenExpanded), [givenExpanded, setIsExpanded])
  useEffect(() => setIsLoading(givenIsLoading ?? false), [givenIsLoading])
  useEffect(() => setIsFetching(givenIsFetching ?? false), [givenIsFetching])

  return (
    <Box sx={{ maxWidth: MaxWidth.actionCard }}>
      <RouteProvidersAccordion
        {...args}
        queries={useMemo(
          () => mapRecord(routes, (_, route) => ({ ...route, isLoading, isFetching: isLoading || isFetching })),
          [isLoading, isFetching, routes],
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
    chainId: 1,
    networks: { 1: {} as BaseConfig },
    queries: fromEntries(
      RouteProviders.map(router => [
        router,
        {
          ...q({
            data: mockRoutes.find(route => route.router === router) ?? null,
            isLoading: false,
            error: null,
          }),
          isFetching: false,
        },
      ]),
    ),
    selectedRoute: mockRoutes[0],
    tokenOut: { symbol: 'crvUSD', decimals: 18, usdRate: constQ(1) },
    isExpanded: false,
    onChange: () => undefined,
    onToggle: () => undefined,
    onRefresh: () => undefined,
    enabled: true,
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}

export const Expanded: Story = {
  args: { isExpanded: true },
}

export const Fetching: Story = {
  args: { isExpanded: true, isFetching: true },
}

export const Loading: Story = {
  args: { isLoading: true },
}
