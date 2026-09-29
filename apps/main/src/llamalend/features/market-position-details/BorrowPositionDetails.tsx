import { useMarketContext } from '@/llamalend/features/market-context'
import { BetaBorrowInformation } from '@/llamalend/features/market-position-details/BetaBorrowInformation'
import { BorrowInformation } from '@/llamalend/features/market-position-details/BorrowInformation'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useBorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { HealthDetails } from './health/HealthDetails'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'

const { Spacing } = SizesAndSpaces

const HEALTH_LEAD_AREAS = `"health range debt leverage" "health buffer collateral roe"`
const MOBILE_HEALTH_AREAS = `"health range" "buffer leverage" "debt debt" "collateral collateral" "roe roe"`

export const BorrowPositionDetails = () =>
  useNewLlamalendHealth() ? <BetaBorrowPositionDetails /> : <LegacyBorrowPositionDetails />

const BetaBorrowPositionDetails = () => {
  const { chainId, marketId, tokens, userAddress } = useMarketContext()
  const view = useBorrowPositionView({ chainId, marketId, userAddress })
  const { provenance, refreshFailed } = view
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      <Box
        data-testid="beta-position-card"
        sx={{
          display: 'grid',
          columnGap: Spacing.md,
          rowGap: Spacing.sm,
          alignItems: 'start',
          gridTemplateColumns: { mobile: '1fr 1fr', tablet: 'repeat(4, minmax(0, 1fr))' },
          gridTemplateAreas: { mobile: MOBILE_HEALTH_AREAS, tablet: HEALTH_LEAD_AREAS },
        }}
      >
        <HealthDetails view={view} />
        <BetaBorrowInformation view={view} tokens={tokens} />
      </Box>
      {refreshFailed && (
        <Typography variant="bodyXsRegular" color="textSecondary" data-testid="position-update-failed">
          {provenance.complete && provenance.oldestAt != null
            ? t`Update failed. Numbers are from the oldest required read at ${new Date(provenance.oldestAt).toLocaleTimeString()}.`
            : t`Update failed. A required input has no observation time, so these numbers are not freshly verified.`}
        </Typography>
      )}
    </Stack>
  )
}

const LegacyBorrowPositionDetails = () => {
  const { chainId, marketId, tokens, userAddress } = useMarketContext()
  const { collateralToken, borrowToken } = tokens
  const params = { chainId, marketId, userAddress }
  const liquidationStatus = useLiquidationStatus(params)
  const softLiquidation = mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      <Stack sx={{ gap: Spacing.sm }}>
        <LegacyHealthDetails params={params} softLiquidation={softLiquidation} />
        <BorrowInformation params={params} tokens={tokens} />
      </Stack>
      {statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
        </Alert>
      )}
    </Stack>
  )
}
