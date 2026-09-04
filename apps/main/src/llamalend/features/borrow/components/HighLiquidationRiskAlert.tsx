import { t } from '@evm-ui/lib/i18n'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { QueryProp } from '@ui/features/queries/util'

export const HighLiquidationRiskAlert = ({
  isHighLiquidationRisk: { data, isLoading, error },
}: {
  isHighLiquidationRisk: QueryProp<boolean | null>
}) =>
  error ? (
    <Alert severity="error" data-testid="high-liquidation-risk-error">
      <AlertTitle>{t`Cannot determine liquidation risk`}</AlertTitle>
      {error.message}
    </Alert>
  ) : (
    data && (
      <WithSkeleton loading={isLoading}>
        <Alert severity="warning" data-testid="high-liquidation-risk-alert" variant="outlined">
          <AlertTitle>{t`High liquidation risk`}</AlertTitle>
          {t`This borrow amount places your liquidation range close to the current price, increasing liquidation risk.`}
        </Alert>
      </WithSkeleton>
    )
  )
