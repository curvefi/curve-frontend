import { useLiquidationStatus } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { getPositionStatusContent } from '@/llamalend/position-status-content'
import { Alert, AlertTitle, Stack, Typography } from '@mui/material'
import type { UserMarketParams } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { BorrowInformation } from './BorrowInformation'
import { HealthDetails } from './HealthDetails'

const { Spacing } = SizesAndSpaces

export type BorrowPositionDetailsProps = { params: UserMarketParams; market: LlamaMarketTemplate | undefined }

export const BorrowPositionDetails = ({ params, market }: BorrowPositionDetailsProps) => {
  const { collateralToken, borrowToken } = market ? getTokens(market) : {}
  const liquidationStatus = useLiquidationStatus(params)
  const statusContent =
    liquidationStatus.data &&
    getPositionStatusContent(collateralToken?.symbol, borrowToken?.symbol)[liquidationStatus.data]
  return (
    <Stack padding={Spacing.sm} gap={Spacing.xs}>
      {statusContent?.hasMarketAlert && (
        <Alert data-testid="borrow-position-status-alert" variant="outlined" severity={statusContent.severity}>
          <AlertTitle>{statusContent.title}</AlertTitle>
          <Stack>
            <Typography variant="bodyXsRegular">{statusContent.description}</Typography>
          </Stack>
        </Alert>
      )}
      <Stack gap={Spacing.sm}>
        <HealthDetails
          params={params}
          softLiquidation={mapQuery(liquidationStatus, positionStatus => positionStatus === 'softLiquidation')}
        />
        <BorrowInformation params={params} market={market} />
      </Stack>
    </Stack>
  )
}
