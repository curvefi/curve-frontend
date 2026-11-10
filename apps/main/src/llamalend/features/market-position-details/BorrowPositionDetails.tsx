import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { getPositionHealthThresholds } from '@/llamalend/health.utils'
import { getMarketAssetsType } from '@/llamalend/market-assets-type.utils'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { usePositionHealth } from '@/llamalend/queries/user/user-health.query'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './health/HealthDetails'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'

const { Spacing } = SizesAndSpaces

export const BorrowPositionDetails = () => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  const { chainId, marketId, tokens, userAddress, controllerAddress } = useMarketContext()
  const { collateralToken, borrowToken } = tokens
  const params = { chainId, marketId, userAddress }
  const liquidationStatus = useLiquidationStatus(params, !isNewLlamalendHealth)
  const thresholds = getPositionHealthThresholds(getMarketAssetsType(chainId, controllerAddress))
  const position = usePositionHealth(params, thresholds)
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  const softLiquidation = mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      <Stack sx={{ gap: Spacing.sm }}>
        {!isNewLlamalendHealth && <LegacyHealthDetails params={params} softLiquidation={softLiquidation} />}
        <BorrowInformation params={params} tokens={tokens}>
          {isNewLlamalendHealth && (
            <HealthDetails position={position} thresholds={thresholds} borrowSymbol={borrowToken?.symbol} />
          )}
        </BorrowInformation>
      </Stack>
      {!isNewLlamalendHealth && statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
        </Alert>
      )}
    </Stack>
  )
}
