import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { peakPrice } from '@ui/features/pools/liquidity-density/curve'
import { liquidityProfile, valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'
import { constQ } from '@ui/features/queries/util'
import { createConfig } from '@wagmi/core'
import { LiquidityDensityChart } from './LiquidityDensityChart'

const cryptoCurve = createTwoCryptoCurve([20_000_000, 180], 110_000, 40, 0.001)!
const cryptoProfile = liquidityProfile(cryptoCurve, [1, 0])!
const stableCurve = createStableSwapCurve([1_400_000, 600_000], [1, 1], 200)!
const stableProfile = valueLiquidityProfile(liquidityProfile(stableCurve, [1, 0])!, 1, 1)
const loadingQuery = { ...constQ(undefined), isLoading: true }
const missingUsdRateQuery = { ...constQ(undefined), error: new globalThis.Error('Unable to load token USD rate') }
const queryClient = new QueryClient()
const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [],
  transports: { [mainnet.id]: http() },
  multiInjectedProviderDiscovery: false,
})

const meta = {
  title: 'DEX/Charts/LiquidityDensityChart',
  component: LiquidityDensityChart,
  decorators: [
    Story => (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      </WagmiProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
  args: {
    profile: constQ(valueLiquidityProfile(cryptoProfile, 111_124.75, 1)),
    inputSymbol: 'WBTC',
    outputSymbol: 'USDC',
    centerPrice: constQ(peakPrice(cryptoCurve, [1, 0])),
    oraclePrice: constQ(109_500),
    action: null,
  },
} satisfies Meta<typeof LiquidityDensityChart>

export default meta
type Story = StoryObj<typeof meta>

export const CryptoSwap: Story = {}

export const StableSwap: Story = {
  args: {
    profile: constQ(stableProfile),
    inputSymbol: 'USDT',
    outputSymbol: 'USDC',
    centerPrice: constQ(peakPrice(stableCurve, [1, 0])),
    oraclePrice: constQ(undefined),
  },
}

export const DepeggedQuote: Story = {
  args: {
    profile: constQ(valueLiquidityProfile(cryptoProfile, 111_124.75, 0.98)),
    centerPrice: constQ(peakPrice(cryptoCurve, [1, 0])! * 0.98),
    oraclePrice: constQ(109_500 * 0.98),
  },
}

export const LoadingUsdRate: Story = {
  args: { profile: loadingQuery, centerPrice: loadingQuery, oraclePrice: loadingQuery },
}

export const LoadingOracle: Story = { args: { oraclePrice: loadingQuery } }

export const MissingUsdRate: Story = {
  args: { profile: missingUsdRateQuery, centerPrice: missingUsdRateQuery, oraclePrice: missingUsdRateQuery },
}

export const MissingIntervals: Story = {
  args: {
    profile: constQ({
      ...stableProfile,
      samples: stableProfile.samples.filter((_, index) => index < 12 || index > 18),
    }),
    inputSymbol: 'USDT',
    outputSymbol: 'USDC',
    centerPrice: constQ(peakPrice(stableCurve, [1, 0])),
    oraclePrice: constQ(undefined),
  },
}

export const Loading: Story = { args: { profile: loadingQuery, centerPrice: loadingQuery, oraclePrice: loadingQuery } }
export const Unavailable: Story = {
  args: { profile: constQ(undefined), centerPrice: constQ(undefined), oraclePrice: constQ(undefined) },
}
export const Error: Story = {
  args: { profile: { ...constQ(undefined), error: new globalThis.Error('Unable to load pool state') } },
}
