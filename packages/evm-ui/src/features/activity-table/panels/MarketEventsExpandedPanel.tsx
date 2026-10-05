import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'
import { formatActivityUsdValue } from '../utils'

export const MarketEventsExpandedPanel: ExpandedPanelComponent<MarketEventRow> = ({
  row: {
    original: { deposit, withdrawal, provider, blockchainId, collateralToken, borrowToken, timestamp },
  },
}) => {
  const currentDate = useCurrentDate()

  return (
    <Stack>
      <MetricsGrid variant="mobileRows">
        {deposit && (
          <MetricExpandedPanel
            label={notFalsy(t`Amount`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
            value={deposit.amount}
            valueOptions={{ color: 'success' }}
            notional={constQ(
              formatActivityUsdValue({ amount: deposit.amount, amountUsd: deposit.amountUsd, timestamp }, currentDate),
            )}
            icon={{ blockchainId, token: collateralToken }}
          />
        )}
        {withdrawal && (
          <>
            {!!withdrawal.amountCollateral && (
              <MetricExpandedPanel
                label={notFalsy(t`Collateral`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
                value={withdrawal.amountCollateral}
                valueOptions={{ color: 'error' }}
                notional={constQ(
                  formatActivityUsdValue(
                    { amount: withdrawal.amountCollateral, amountUsd: withdrawal.amountCollateralUsd, timestamp },
                    currentDate,
                  ),
                )}
                icon={{ blockchainId, token: collateralToken }}
              />
            )}
            {!!withdrawal.amountBorrowed && (
              <MetricExpandedPanel
                label={notFalsy(t`Borrowed`, borrowToken?.symbol && `(${borrowToken.symbol})`).join(' ')}
                value={withdrawal.amountBorrowed}
                valueOptions={{ color: 'error' }}
                notional={constQ(
                  formatActivityUsdValue(
                    { amount: withdrawal.amountBorrowed, amountUsd: withdrawal.amountBorrowedUsd, timestamp },
                    currentDate,
                  ),
                )}
                icon={{ blockchainId, token: borrowToken }}
              />
            )}
          </>
        )}
      </MetricsGrid>
      <ActionInfo label={t`User`} value={shortenString(provider)} />
    </Stack>
  )
}
