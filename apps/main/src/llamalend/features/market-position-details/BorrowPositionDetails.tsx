import { useMarketContext } from '@/llamalend/features/market-context'
import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { BorrowInformation } from './BorrowInformation'
import { LegacyHealthDetails } from './health/LegacyHealthDetails'
import { LegacyBorrowInformation } from './LegacyBorrowInformation'

const { Spacing } = SizesAndSpaces

export const BorrowPositionDetails = () => {
  const isNewLlamalendHealth = useNewLlamalendHealth()
  const { chainId, marketId, tokens, userAddress } = useMarketContext()
  const { collateralToken, borrowToken } = tokens
  const params = { chainId, marketId, userAddress }
  const liquidationStatus = useLiquidationStatus(params, !isNewLlamalendHealth)
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  const softLiquidation = mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')
  return (
    <Stack sx={{ padding: Spacing.md, gap: Spacing.xs }}>
      <Stack sx={{ gap: Spacing.sm }}>
        {isNewLlamalendHealth ? (
          <BorrowInformation params={params} tokens={tokens} />
        ) : (
          <>
            <LegacyHealthDetails params={params} softLiquidation={softLiquidation} />
            <LegacyBorrowInformation params={params} tokens={tokens} />
          </>
        )}
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
