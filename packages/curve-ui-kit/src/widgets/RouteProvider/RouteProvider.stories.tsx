import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react'
import { ethAddress } from 'viem'
import { WagmiProvider } from 'wagmi'
import Box from '@mui/material/Box'
import { fromEntries, mapRecord } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { BaseConfig } from '@ui/utils'
import { createTestWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/wagmi-test-config'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { TestQueryProvider } from '@ui-kit/lib/queries/test-query.provider.test'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ, q } from '@ui-kit/types/util'
import { mockRoutes } from '@ui-kit/widgets/RouteProvider/route.mock'
import { type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces
const mockedWagmiConfig = createTestWagmiConfig()

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  isFetching: givenIsFetching,
  queries: givenRoutes,
  queryData,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps & {
  isLoading?: boolean
  isFetching?: boolean
  queryData?: ComponentProps<typeof TestQueryProvider>['data']
}) => {
  const [routes, setRoutes] = useState(givenRoutes)
  const [selectedRouter, setSelectedRouter] = useState(givenSelectedRoute?.router)
  const [isLoading, setIsLoading] = useState(givenIsLoading ?? false)
  const [isFetching, setIsFetching] = useState(false)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setRoutes(givenRoutes), [givenRoutes])
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setSelectedRouter(givenSelectedRoute?.router), [givenSelectedRoute])
  useEffect(() => setIsExpanded(givenExpanded), [givenExpanded, setIsExpanded])
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setIsLoading(givenIsLoading ?? false), [givenIsLoading])
  // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
  useEffect(() => setIsFetching(givenIsFetching ?? false), [givenIsFetching])

  return (
    <WagmiProvider config={mockedWagmiConfig}>
      <TestQueryProvider data={queryData ?? []}>
        <Box sx={{ maxWidth: MaxWidth.actionCard }}>
          <RouteProvidersAccordion
            {...args}
            queries={useMemo(
              () => mapRecord(routes, (_, route) => ({ ...route, isLoading, isFetching: isLoading || isFetching })),
              [isLoading, isFetching, routes],
            )}
            selectedRoute={selectedRouter && (routes[selectedRouter]?.data ?? undefined)}
            onChange={setSelectedRouter}
            isExpanded={isExpanded}
            onToggle={toggle}
            onRefresh={useCallback(() => {
              setIsLoading(true)
              const timeout = setTimeout(() => setIsLoading(false), 1000)
              return () => clearTimeout(timeout)
            }, [])}
          />
        </Box>
      </TestQueryProvider>
    </WagmiProvider>
  )
}

const meta: Meta<typeof RouteProviderStory> = {
  title: 'UI Kit/Widgets/RouteProvidersAccordion',
  component: RouteProviderStory,
  args: {
    chainId: 1,
    networks: { 1: { name: 'Ethereum' } as BaseConfig },
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
          enabled: true,
        },
      ]),
    ),
    providers: RouteProviders,
    selectedRoute: mockRoutes[0],
    selectedRouter: mockRoutes[0].router,
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

export const GasEstimate: Story = {
  args: {
    isExpanded: true,
    networks: {
      1: {
        name: 'Ethereum',
        symbol: 'ETH',
        gasL2: false,
        gasPricesDefault: 0,
        gasPricesUnit: 'GWEI',
        gasPricesUrl: 'https://api.curve.finance/api/getGas',
      } as BaseConfig,
    },
    queryData: [
      [['chain', { chainId: 1 }, 'token', { tokenAddress: ethAddress }, 'usdRate'], 3_000],
      [
        [
          'chain',
          { chainId: 1 },
          { gasPricesUrl: 'https://api.curve.finance/api/getGas' },
          { gasPricesUrlL2: undefined },
          'gasInfo',
        ],
        { gasPrice: null, max: [], priority: [], basePlusPriority: [30_000_000_000] },
      ],
    ],
  },
}

export const Disabled: Story = {
  args: {
    isExpanded: true,
    queries: fromEntries(
      RouteProviders.map(router => [
        router,
        {
          ...q({
            data: null,
            isLoading: false,
            error: null,
          }),
          isFetching: false,
          enabled: false,
        },
      ]),
    ),
  },
}

export const Fetching: Story = {
  args: { isExpanded: true, isFetching: true },
}

export const Loading: Story = {
  args: { isLoading: true },
}
