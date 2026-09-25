import type { ComponentProps } from 'react'
import { ethAddress, getAddress } from 'viem'
import { Route } from '@/dex/components/PageRouterSwap/types'
import type { TokenMapper } from '@/dex/queries/tokens.query'
import { CRVUSD_ADDRESS, REUSD_ADDRESS } from '@evm-ui/utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { q } from '@ui/features/queries/util'
import { RoutesActionInfo } from './RoutesActionInfo'

const tokens: TokenMapper = {
  [getAddress(REUSD_ADDRESS)]: { decimals: 18, symbol: 'reUSD' },
  [getAddress(ethAddress)]: { decimals: 18, symbol: 'ETH' },
  [getAddress(CRVUSD_ADDRESS)]: { decimals: 18, symbol: 'crvUSD' },
}

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
  title: 'DEX/Components/RoutesActionInfo',
  component: RoutesActionInfoStory,
  argTypes: { loading: { control: 'boolean' }, errorMessage: { control: 'text' } },
  args: {
    params: { network: 'ethereum' },
    routes: undefined,
    loading: false,
    errorMessage: '',
    tokens,
    swapCustomRouteRedirect: undefined,
  },
}

export default meta

type Story = StoryObj<typeof RoutesActionInfoStory>

export const Loading: Story = { args: { loading: true, routes: undefined } }
export const SingleRoute: Story = { args: { routes: routes.slice(0, 1) } }
export const MultipleRoutes: Story = { args: { routes } }
