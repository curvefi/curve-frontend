import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { observationTime, riskProvenance } from '@/llamalend/position-metrics/provenance'
import { usePositionSnapshot } from '@/llamalend/position-metrics/snapshot.query'
import { snapshotValue } from '@/llamalend/position-metrics/snapshot.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { useUserState } from '@/llamalend/queries/user'
import { useUserHealthValues } from '@/llamalend/queries/user/user-health.query'
import { useUserPrices } from '@/llamalend/queries/user/user-prices.query'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './health/HealthDetails'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'
import { resolvePositionStatus } from './position-status.utils'

const { Spacing } = SizesAndSpaces

const HEALTH_LEAD_AREAS = `"health range buffer collateral" "status debt leverage roe"`
const BUFFER_LEAD_AREAS = `"buffer range health collateral" "status debt leverage roe"`
const MOBILE_HEALTH_AREAS = `"health status" "range range" "buffer buffer" "collateral collateral" "debt debt" "leverage leverage" "roe roe"`
const MOBILE_BUFFER_AREAS = `"buffer status" "range range" "health health" "collateral collateral" "debt debt" "leverage leverage" "roe roe"`

export const BorrowPositionDetails = () => {
  const { chainId, marketId, tokens, userAddress, controllerAddress } = useMarketContext()
  const { collateralToken, borrowToken } = tokens
  const params = { chainId, marketId, userAddress }
  const liquidationStatus = useLiquidationStatus(params)
  const useNewHealth = useNewLlamalendHealth()
  const health = useUserHealthValues(params, useNewHealth)
  const snapshot = usePositionSnapshot(params, useNewHealth)
  const oracle = useMarketOraclePrice(params)
  const userPrices = useUserPrices(params)
  const userState = useUserState(params)
  const snapshotOracle = snapshotValue(snapshot.data?.oraclePrice)
  const snapshotUpper = snapshotValue(snapshot.data?.upperPrice)
  const snapshotLower = snapshotValue(snapshot.data?.lowerPrice)
  const snapshotCollateral = snapshotValue(snapshot.data?.collateralTokenAmount)
  const lead =
    snapshotOracle && snapshotUpper && snapshotLower && snapshotCollateral
      ? resolvePositionStatus({
          oraclePrice: snapshotOracle,
          upperPrice: snapshotUpper,
          lowerPrice: snapshotLower,
          fullHealth: snapshotValue(snapshot.data?.fullHealthPercentagePoints),
          collateralQuantity: snapshotCollateral,
          liquidationPredicate: snapshot.data?.liquidationPredicate ?? 'unverified',
          assetsType: getMarketAssetsType(chainId, controllerAddress),
        }).lead
      : 'health'
  const watched = [snapshot, oracle, userPrices, userState]
  const refreshFailed = watched.some(query => query.error != null && query.data != null)
  const provenance = snapshot.data
    ? { oldestAt: snapshot.data.observedAt, complete: true }
    : riskProvenance([observationTime(oracle), observationTime(userState), undefined, undefined])
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  const softLiquidation = mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      {useNewHealth ? (
        <>
        <Box
          data-testid="beta-position-card"
          sx={{
            display: 'grid',
            columnGap: Spacing.md,
            rowGap: Spacing.sm,
            alignItems: 'start',
            gridTemplateColumns: { mobile: '1fr 1fr', tablet: 'minmax(7rem,0.9fr) minmax(12rem,1.6fr) minmax(9rem,1.1fr) minmax(11rem,1.3fr)' },
            gridTemplateAreas: {
              mobile: lead === 'buffer' ? MOBILE_BUFFER_AREAS : MOBILE_HEALTH_AREAS,
              tablet: lead === 'buffer' ? BUFFER_LEAD_AREAS : HEALTH_LEAD_AREAS,
            },
          }}
        >
          <HealthDetails health={health} positionStatus={liquidationStatus} />
          <BorrowInformation params={params} tokens={tokens} />
        </Box>
        {refreshFailed && (
          <Typography variant="bodyXsRegular" color="textSecondary" data-testid="position-update-failed">
            {provenance.complete && provenance.oldestAt != null
              ? t`Update failed. Numbers are from the oldest required read at ${new Date(provenance.oldestAt).toLocaleTimeString()}.`
              : t`Update failed. A required input has no observation time, so these numbers are not freshly verified.`}
          </Typography>
        )}
        </>
      ) : (
        <Stack sx={{ gap: Spacing.sm }}>
          <LegacyHealthDetails params={params} softLiquidation={softLiquidation} />
          <BorrowInformation params={params} tokens={tokens} />
        </Stack>
      )}
      {!useNewHealth && statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
        </Alert>
      )}
    </Stack>
  )
}
