import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { useNewLlamalendHealth } from '@ui-kit/hooks/useFeatureFlags'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './health/HealthDetails'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'

const { Spacing } = SizesAndSpaces

export const BorrowPositionDetails = ({ compact }: { compact: boolean }) => {
  const { chainId, marketId, tokens, userAddress } = useMarketContext()
  const { collateralToken, borrowToken } = tokens
  const params = { chainId, marketId, userAddress }
  const liquidationStatus = useLiquidationStatus(params)
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  const softLiquidation = mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')
  const useNewHealth = useNewLlamalendHealth()
  return (
    <Stack sx={{ padding: Spacing.sm, gap: Spacing.xs }}>
      {statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Stack>
            <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
          </Stack>
        </Alert>
      )}
      <Stack sx={{ gap: Spacing.sm }}>
        {useNewHealth ? (
          <HealthDetails params={params} />
        ) : (
          <LegacyHealthDetails params={params} softLiquidation={softLiquidation} />
        )}
        <BorrowInformation params={params} tokens={tokens} compact={compact} />
      </Stack>
    </Stack>
  )
}
