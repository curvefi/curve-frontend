import { type ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ethAddress } from 'viem'
import { WagmiProvider } from 'wagmi'
import { createTestWagmiConfig } from '@evm-ui/features/connect-wallet/lib/wagmi/wagmi-test-config'
import { mockRoutes } from '@evm-ui/widgets/RouteProvider/route.mock'
import Box from '@mui/material/Box'
import { areEntriesSame, fromEntries, mapRecord } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestQueryProvider } from '@ui/features/queries/test-query.provider.test'
import { constQ, q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { type RouteProviderProps, RouteProvidersAccordion } from './RouteProvidersAccordion'

const { MaxWidth } = SizesAndSpaces
const mockedWagmiConfig = createTestWagmiConfig()

const RouteProviderStory = ({
  isExpanded: givenExpanded,
  isLoading: givenIsLoading,
  isFetching = false,
  queries: routes,
  queryData,
  selectedRoute: givenSelectedRoute,
  ...args
}: RouteProviderProps & {
  isLoading?: boolean
  isFetching?: boolean
  queryData?: ComponentProps<typeof TestQueryProvider>['data']
}) => {
  const [selectedRouter, setSelectedRouter] = useState(givenSelectedRoute?.router)
  const [isLoading, setIsLoading] = useState(givenIsLoading ?? false)
  const [isExpanded, , , toggle, setIsExpanded] = useSwitch(givenExpanded)
  const inputs = { givenSelectedRoute, givenIsLoading, givenExpanded }
  const [previousInputs, setPreviousInputs] = useState(inputs)
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  if (!areEntriesSame(previousInputs, inputs)) {
    setPreviousInputs(inputs)
    if (previousInputs.givenSelectedRoute !== givenSelectedRoute) setSelectedRouter(givenSelectedRoute?.router)
    if (previousInputs.givenIsLoading !== givenIsLoading) setIsLoading(givenIsLoading ?? false)
    if (previousInputs.givenExpanded !== givenExpanded) setIsExpanded(givenExpanded)
  }

  useEffect(() => () => clearTimeout(refreshTimeoutRef.current), [])

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
            selectedRouter={selectedRouter}
            onChange={setSelectedRouter}
            isExpanded={isExpanded}
            onToggle={toggle}
            onRefresh={useCallback(() => {
              clearTimeout(refreshTimeoutRef.current)
              setIsLoading(true)
              refreshTimeoutRef.current = setTimeout(() => setIsLoading(false), 1000)
            }, [])}
          />
        </Box>
      </TestQueryProvider>
    </WagmiProvider>
  )
}

const meta: Meta<typeof RouteProviderStory> = {
  title: 'EVM UI/Widgets/RouteProvider',
  component: RouteProviderStory,
  args: {
    chainId: 1,
    queries: fromEntries(
      RouteProviders.map(router => [
        router,
        {
          ...q({ data: mockRoutes.find(route => route.router === router) ?? null, isLoading: false, error: null }),
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

export const Expanded: Story = { args: { isExpanded: true } }

export const GasEstimate: Story = {
  args: {
    isExpanded: true,
    queryData: [
      [{ name: 'usdRate', chainId: 1, tokenAddress: ethAddress }, 3_000],
      [
        {
          name: 'gasInfo',
          chainId: 1,
          gasPricesUrl: 'https://api.curve.finance/api/getGas',
          gasPricesUrlL2: undefined,
        },
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
        { ...q({ data: null, isLoading: false, error: null }), isFetching: false, enabled: false },
      ]),
    ),
  },
}

export const Fetching: Story = { args: { isExpanded: true, isFetching: true } }

export const Loading: Story = { args: { isLoading: true } }
