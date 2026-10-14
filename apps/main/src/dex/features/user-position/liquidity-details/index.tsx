import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { BalancedWithdrawCard } from './components/BalancedWithdrawCard'
import { MarketParticipationCard } from './components/MarketParticipationCard'
import { Metrics } from './components/Metrics'
import type { LiquidityDetailsData } from './types'

const { Spacing } = SizesAndSpaces

const CARD_GRID_SIZE = { mobile: 12, desktop: 6 } as const

export const LiquidityDetails = ({
  blockchainId,
  showBoost,
  marketParticipation,
  metrics,
  rows,
}: { blockchainId: string } & LiquidityDetailsData) => (
  <Stack sx={{ gap: Spacing.md, padding: Spacing.sm }}>
    <Metrics showBoost={showBoost} metrics={metrics} />

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
