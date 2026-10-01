import Stack from '@mui/material/Stack'
import { notFalsy } from '@primitives/objects.utils'
import { shortenString } from '@primitives/string.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { MarketEventRow } from '../types'
import { formatActivityUsdValue } from '../utils'

const EXPANDED_METRIC_CATEGORY = 'llamalend.marketParticipantsExpanded'

export const MarketEventsExpandedPanel: ExpandedPanelComponent<MarketEventRow> = ({
  row: {
    original: { deposit, withdrawal, provider, blockchainId, collateralToken, borrowToken, timestamp },
  },
}) => {
  const currentTime = useCurrentDate().getTime()

  return (
    <Stack>
      <MetricsGrid variant="mobileRows">
        {deposit && (
          <Metric
            category={EXPANDED_METRIC_CATEGORY}
            label={notFalsy(t`Amount`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
            value={deposit.amount}
            valueOptions={{ abbreviate: false, fallback: '-', color: 'success' }}
            notional={constQ(
              formatActivityUsdValue({ amount: deposit.amount, amountUsd: deposit.amountUsd, timestamp }, currentTime),
            )}
            icon={
              collateralToken && (
                <TokenIcon blockchainId={blockchainId} address={collateralToken.address} size="mui-sm" />
              )
            }
          />
        )}
        {withdrawal && (
          <>
            {!!withdrawal.amountCollateral && (
              <Metric
                category={EXPANDED_METRIC_CATEGORY}
                label={notFalsy(t`Collateral`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
                value={withdrawal.amountCollateral}
                valueOptions={{ abbreviate: false, fallback: '-', color: 'error' }}
                notional={constQ(
                  formatActivityUsdValue(
                    { amount: withdrawal.amountCollateral, amountUsd: withdrawal.amountCollateralUsd, timestamp },
                    currentTime,
                  ),
                )}
                icon={
                  collateralToken && (
                    <TokenIcon blockchainId={blockchainId} address={collateralToken.address} size="mui-sm" />
                  )
                }
              />
            )}
            {!!withdrawal.amountBorrowed && (
              <Metric
                category={EXPANDED_METRIC_CATEGORY}
                label={notFalsy(t`Borrowed`, borrowToken?.symbol && `(${borrowToken.symbol})`).join(' ')}
                value={withdrawal.amountBorrowed}
                valueOptions={{ abbreviate: false, fallback: '-', color: 'error' }}
                notional={constQ(
                  formatActivityUsdValue(
                    { amount: withdrawal.amountBorrowed, amountUsd: withdrawal.amountBorrowedUsd, timestamp },
                    currentTime,
                  ),
                )}
                icon={
                  borrowToken && <TokenIcon blockchainId={blockchainId} address={borrowToken.address} size="mui-sm" />
                }
              />
            )}
          </>
        )}
      </MetricsGrid>
      <ActionInfo label={t`User`} value={shortenString(provider)} size="small" />
    </Stack>
  )
}
