import { useMarketContext } from '@/llamalend/features/market-context'
import { BetaBorrowInformation } from '@/llamalend/features/market-position-details/BetaBorrowInformation'
import { BorrowInformation } from '@/llamalend/features/market-position-details/BorrowInformation'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useBorrowPositionView } from '@/llamalend/position-metrics/use-borrow-position-view'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { BetaHealthDetails } from './health/BetaHealthDetails'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'

const { Spacing } = SizesAndSpaces

const HEALTH_LEAD_AREAS = `"health range debt leverage" "health buffer collateral roe"`
const MOBILE_HEALTH_AREAS = `"health range" "health buffer" "leverage leverage" "debt debt" "collateral collateral" "roe roe"`

export const BorrowPositionDetails = () =>
  useNewLlamalendHealth() ? <BetaBorrowPositionDetails /> : <LegacyBorrowPositionDetails />

const BetaBorrowPositionDetails = () => {
  const { chainId, marketId, tokens, userAddress } = useMarketContext()
  const view = useBorrowPositionView({ chainId, marketId, userAddress })
  const { provenance, refreshFailed } = view
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      <MetricsGrid
        data-testid="beta-position-card"
        sx={{
          alignItems: 'start',
          gridTemplateAreas: { mobile: MOBILE_HEALTH_AREAS, tablet: HEALTH_LEAD_AREAS },
          rowGap: Spacing.sm,
        }}
      >
        <BetaHealthDetails view={view} borrowSymbol={tokens.borrowToken?.symbol ?? ''} />
        <BetaBorrowInformation view={view} tokens={tokens} />
      </MetricsGrid>
      {refreshFailed && (
        <Alert data-testid="position-update-failed" variant="outlined" severity="warning">
          <Typography variant="bodyXsRegular">
            {provenance.complete && provenance.oldestAt != null
              ? t`Update failed. Numbers are from the oldest required read at ${new Date(provenance.oldestAt).toLocaleTimeString()}.`
              : t`Update failed. A required input has no observation time, so these numbers are not freshly verified.`}
          </Typography>
        </Alert>
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
