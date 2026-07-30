import type { ComponentProps } from 'react'
import { ethAddress } from 'viem'
import { Route } from '@/dex/components/PageRouterSwap/types'
import { PoolDataMapper, TokensNameMapper } from '@/dex/types/main.types'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { q } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS, REUSD_ADDRESS } from '@ui-kit/utils'
import { RoutesActionInfo } from './RoutesActionInfo'

const tokensNameMapper: TokensNameMapper = { [REUSD_ADDRESS]: 'reUSD', [ethAddress]: 'ETH', [CRVUSD_ADDRESS]: 'crvUSD' }

const poolDataMapper = {
  'pool-1': {
    chainId: 1,
    tokenAddresses: [REUSD_ADDRESS, ethAddress],
    tokens: ['USDT', 'ETH'],
    pool: { id: 'pool-1', name: 'USDT/ETH' },
  },
  'pool-2': {
    chainId: 1,
    tokenAddresses: [ethAddress, CRVUSD_ADDRESS],
    tokens: ['ETH', 'USDC'],
    pool: { id: 'pool-2', name: 'ETH/USDC' },
  },
} as const

const routes = [
  {
    poolId: 'pool-1',
    inputCoinAddress: REUSD_ADDRESS,
    outputCoinAddress: ethAddress,
    name: 'reUSD/ETH',
    routeUrlId: 'reusd-eth',
  },
  { poolId: 'pool-2', inputCoinAddress: ethAddress, outputCoinAddress: CRVUSD_ADDRESS, name: 'ETH/crvUSD Pool' },
] as Route[]

type RoutesActionInfoStoryArgs = Omit<ComponentProps<typeof RoutesActionInfo>, 'routes'> & {
  routes?: Route[]
  loading?: boolean
  errorMessage?: string
}

const RoutesActionInfoStory = ({ routes, loading, errorMessage, ...args }: RoutesActionInfoStoryArgs) => (
  <RoutesActionInfo
    {...args}
    routes={q({ data: routes, isLoading: !!loading, error: errorMessage ? new Error(errorMessage) : null })}
  />
)

const meta: Meta<typeof RoutesActionInfoStory> = {
  title: 'DEX/PageRouterSwap/DetailInfoTradeRoute',
  component: RoutesActionInfoStory,
  argTypes: {
    loading: { control: 'boolean' },
    errorMessage: { control: 'text' },
  },
  args: {
    params: { network: 'ethereum' },
    routes: undefined,
    loading: false,
    errorMessage: '',
    tokensNameMapper,
    poolDataMapper: poolDataMapper as unknown as PoolDataMapper,
    swapCustomRouteRedirect: undefined,
  },
}

export default meta

type Story = StoryObj<typeof RoutesActionInfoStory>

export const Loading: Story = { args: { loading: true, routes: undefined } }
export const SingleRoute: Story = { args: { routes: routes.slice(0, 1) } }
export const MultipleRoutes: Story = { args: { routes } }
