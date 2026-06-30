import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BalancedWithdrawCard } from './components/BalancedWithdrawCard'
import { MarketParticipationCard } from './components/MarketParticipationCard'
import { Metrics } from './components/Metrics'
import { useLiquidityDetails, type UseLiquidityDetailsParams } from './hooks/useLiquidityDetails'

const { Spacing } = SizesAndSpaces

const CARD_GRID_SIZE = { mobile: 12, desktop: 6 } as const

export const LiquidityDetails = ({ blockchainId, ...params }: { blockchainId: string } & UseLiquidityDetailsParams) => {
  const { marketParticipation, metrics, rows } = useLiquidityDetails(params)

  return (
    <Stack sx={{ gap: Spacing.md, padding: Spacing.sm }}>
      <Metrics chainId={params.chainId} metrics={metrics} />

      <Grid container spacing={Spacing.md}>
        <Grid size={CARD_GRID_SIZE}>
          <MarketParticipationCard marketParticipation={marketParticipation} />
        </Grid>
        <Grid size={CARD_GRID_SIZE}>
          <BalancedWithdrawCard blockchainId={blockchainId} rows={rows} />
        </Grid>
      </Grid>
    </Stack>
  )
}
