import { http } from 'viem'
import { mainnet } from 'viem/chains'
import { WagmiProvider } from 'wagmi'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { peakPrice } from '@ui/features/pools/liquidity-density/curve'
import { liquidityProfile, valueLiquidityProfile } from '@ui/features/pools/liquidity-density/profile'
import { createStableSwapCurve } from '@ui/features/pools/liquidity-density/stableswap'
import { createTwoCryptoCurve } from '@ui/features/pools/liquidity-density/twocrypto'
import { createConfig } from '@wagmi/core'
import { LiquidityDensityChart } from './LiquidityDensityChart'

const cryptoCurve = createTwoCryptoCurve([20_000_000, 180], 110_000, 40, 0.001)!
const cryptoProfile = liquidityProfile(cryptoCurve, [1, 0], { points: 48 })!
const stableCurve = createStableSwapCurve([1_400_000, 600_000], [1, 1], 200)!
const stableProfile = liquidityProfile(stableCurve, [1, 0], { points: 48 })!
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
    profile: valueLiquidityProfile(cryptoProfile, 111_124.75),
    inputSymbol: 'WBTC',
    outputSymbol: 'USDC',
    unit: 'dollar',
    centerPrice: peakPrice(cryptoCurve, [1, 0]),
    oraclePrice: 109_500,
  },
} satisfies Meta<typeof LiquidityDensityChart>

export default meta
type Story = StoryObj<typeof meta>

export const CryptoSwap: Story = {}

export const StableSwap: Story = {
  args: {
    profile: stableProfile,
    inputSymbol: 'USDT',
    outputSymbol: 'USDC',
    centerPrice: peakPrice(stableCurve, [1, 0]),
    oraclePrice: undefined,
  },
}

export const TokenUnits: Story = { args: { profile: cryptoProfile, unit: { symbol: ' WBTC', position: 'suffix' } } }

export const MissingIntervals: Story = {
  args: {
    profile: { ...stableProfile, samples: stableProfile.samples.filter((_, index) => index < 12 || index > 18) },
    inputSymbol: 'USDT',
    outputSymbol: 'USDC',
    centerPrice: peakPrice(stableCurve, [1, 0]),
    oraclePrice: undefined,
  },
}

export const Loading: Story = { args: { profile: undefined, isLoading: true } }
export const Unavailable: Story = { args: { profile: undefined, centerPrice: undefined, oraclePrice: undefined } }
export const Error: Story = { args: { profile: undefined, error: new globalThis.Error('Unable to load pool state') } }
