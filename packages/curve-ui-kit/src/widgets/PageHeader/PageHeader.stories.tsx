import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokenIcons } from '@ui-kit/shared/ui/TokenIcons'
import { TokenPair } from '@ui-kit/shared/ui/TokenPair'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { constQ, q } from '@ui-kit/types/util'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'
import { PageHeader } from './PageHeader'

const { Spacing } = SizesAndSpaces

const TOKENS = {
  crvUSD: { symbol: 'crvUSD', address: CRVUSD_ADDRESS },
  scrvUSD: { symbol: 'scrvUSD', address: '0x0655977feb2f289a4ab78af67bab0d17aab84367' },
  wstETH: { symbol: 'wstETH', address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0' },
  usdc: { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  usdt: { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
}

const LlamaTitleItems = ({ marketType }: { marketType: 'Lend' | 'Mint' }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
    <ChainIcon blockchainId="ethereum" />
    <Badge size="extraSmall" label={marketType} />
  </Stack>
)

const meta: Meta<typeof PageHeader> = {
  title: 'UI Kit/Widgets/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: 'Page title',
  },
  render: args => (
    <Box sx={{ width: '100%', padding: '4rem 2rem' }}>
      <PageHeader {...args} />
    </Box>
  ),
}

export default meta

type Story = StoryObj<typeof PageHeader>

export const DexPool: Story = {
  args: {
    title: 'crvUSD/USDC/USDT',
    icon: <TokenIcons blockchainId="ethereum" tokens={[TOKENS.crvUSD, TOKENS.usdc, TOKENS.usdt]} />,
    rightItems: (
      <Stack direction="row" sx={{ gap: Spacing.xl }}>
        <Metric label="TVL" value={constQ(246_800_000)} valueOptions={{ unit: 'dollar' }} alignment="end" />
        <Metric label="24h volume" value={constQ(48_200_000)} valueOptions={{ unit: 'dollar' }} alignment="end" />
      </Stack>
    ),
  },
}

export const LlamalendLendMarket: Story = {
  args: {
    backHref: '/llamalend/ethereum/markets',
    title: `${TOKENS.wstETH.symbol.toUpperCase()} • ${TOKENS.crvUSD.symbol.toUpperCase()}`,
    subtitle: `Use ${TOKENS.wstETH.symbol} to borrow ${TOKENS.crvUSD.symbol}`,
    icon: <TokenPair chain="ethereum" assets={{ primary: TOKENS.wstETH, secondary: TOKENS.crvUSD }} hideChainIcon />,
    titleItems: <LlamaTitleItems marketType="Lend" />,
    rightItems: (
      <Stack direction="row" sx={{ gap: Spacing.xxl, flexWrap: 'wrap' }}>
        <Metric
          alignment="end"
          label="Borrow APR"
          value={constQ(2.082)}
          valueOptions={{ unit: 'percentage' }}
          notional={{ value: 2.075, unit: { symbol: '% 7d Avg', position: 'suffix' } }}
        />
        <Metric
          alignment="end"
          label="Net supply APY"
          value={constQ(4.037)}
          valueOptions={{ unit: 'percentage' }}
          notional={{ value: 4.034, unit: { symbol: '% 7d Avg', position: 'suffix' } }}
        />
        <Metric
          alignment="end"
          label="Available liquidity"
          value={constQ(12_500_000)}
          valueOptions={{ unit: 'none' }}
          notional={{ value: 12_750_000, unit: 'dollar' }}
        />
      </Stack>
    ),
  },
}

export const SavingsCrvUsd: Story = {
  args: {
    title: 'Savings crvUSD',
    subtitle: 'Let your idle crvUSD do more for you.',
    icon: <TokenIcon blockchainId="ethereum" address={TOKENS.scrvUSD.address} tooltip="scrvUSD" size="xl" />,
  },
}

export const Loading: Story = {
  args: {
    title: 'Loading market',
    subtitle: 'Loading subtitle',
    titleLoading: true,
    subtitleLoading: true,
    icon: <TokenPair chain="ethereum" assets={{ primary: TOKENS.wstETH, secondary: TOKENS.crvUSD }} hideChainIcon />,
    titleItems: <LlamaTitleItems marketType="Lend" />,
    rightItems: (
      <>
        <Metric
          label="24h volume"
          value={q({ isLoading: true, data: undefined, error: null })}
          valueOptions={{ unit: 'dollar' }}
          alignment="end"
        />
        <Metric
          label="TVL"
          value={q({ isLoading: true, data: undefined, error: null })}
          valueOptions={{ unit: 'dollar' }}
          alignment="end"
        />
      </>
    ),
  },
}

export const ErrorState: Story = {
  args: {
    rightItems: (
      <Metric
        label="24h volume"
        value={q({ isLoading: false, data: undefined, error: new Error('An error occurred') })}
        valueOptions={{ unit: 'dollar' }}
        alignment="end"
      />
    ),
  },
}
