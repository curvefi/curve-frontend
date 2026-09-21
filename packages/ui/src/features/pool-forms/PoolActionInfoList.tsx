import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

type PoolActionInfoListProps = {
  gas: QueryProp<TxGasInfo | null>
  expectedLp?: QueryProp<Decimal>
  expectedLpLabel?: string
  expectedLpTestId?: string
  minimumLp?: QueryProp<Decimal>
  maximumLp?: QueryProp<Decimal>
  currentLp?: QueryProp<Decimal>
  currentLpTestId?: string
  projectedLp?: QueryProp<Decimal>
  projectedLpLabel?: string
  projectedLpTestId?: string
  seedLock?: QueryProp<Decimal | null>
  minimumReceived?: QueryProp<Decimal>
  toSymbol?: string | undefined
}

export const PoolActionInfoList = ({
  gas,
  expectedLp,
  expectedLpLabel,
  expectedLpTestId,
  minimumLp,
  maximumLp,
  currentLp,
  currentLpTestId,
  projectedLp,
  projectedLpLabel,
  projectedLpTestId,
  seedLock,
  minimumReceived,
  toSymbol,
}: PoolActionInfoListProps) => (
  <Stack>
    {expectedLp && expectedLpLabel && expectedLpTestId && (
      <ActionInfo
        testId={expectedLpTestId}
        label={expectedLpLabel}
        value={mapQuery(expectedLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {minimumLp && (
      <ActionInfo
        testId="pool-deposit-minimum-lp"
        label={t`Minimum LP received`}
        value={mapQuery(minimumLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {maximumLp && (
      <ActionInfo
        testId="pool-withdraw-maximum-lp"
        label={t`Maximum LP burned`}
        value={mapQuery(maximumLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {currentLp && currentLpTestId && (
      <ActionInfo
        testId={currentLpTestId}
        label={t`Current LP balance`}
        value={mapQuery(currentLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {projectedLp && projectedLpLabel && projectedLpTestId && (
      <ActionInfo
        testId={projectedLpTestId}
        label={projectedLpLabel}
        value={mapQuery(projectedLp, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {seedLock && (
      <ActionInfo
        testId="pool-deposit-seed-lock"
        label={t`Permanently locked LP`}
        value={mapQuery(seedLock, value => formatNumber(value, 'token.balance'))}
        size="small"
      />
    )}
    {minimumReceived && (
      <ActionInfo
        testId="pool-swap-minimum-received"
        label={t`Minimum received`}
        value={mapQuery(minimumReceived, value => formatToken(value, toSymbol, 'balance'))}
        size="small"
      />
    )}
    <ActionInfoGasEstimate gas={gas} />
  </Stack>
)
