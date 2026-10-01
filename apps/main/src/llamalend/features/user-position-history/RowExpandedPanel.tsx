import { formatActivityUsdValue } from '@evm-ui/features/activity-table/utils'
import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import { BlockchainIds } from '@evm-ui/utils/network'
import { notFalsy } from '@primitives/objects.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

const getChangeColor = (amount: number, positive: 'success' | 'error', negative: 'success' | 'error') =>
  amount > 0 ? positive : amount < 0 ? negative : 'textPrimary'

export const RowExpandedPanel: ExpandedPanelComponent<ParsedUserCollateralEvent> = ({ row: { original: event } }) => {
  const {
    chainId,
    loanChange,
    loanChangeUsd,
    borrowToken,
    collateralChange,
    collateralChangeUsd,
    collateralToken,
    timestamp,
  } = event
  const currentTime = useCurrentDate().getTime()
  const blockchainId = BlockchainIds[chainId]
  const hasCollateralChange = collateralChange !== 0
  const hasLoanChange = loanChange !== 0

  return (
    <MetricsGrid variant="mobileRows">
      <MetricExpandedPanel
        label={notFalsy(t`Collateral`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
        value={hasCollateralChange ? collateralChange : null}
        valueOptions={{ signDisplay: 'exceptZero', color: getChangeColor(collateralChange, 'success', 'error') }}
        {...(hasCollateralChange && {
          notional: constQ(
            formatActivityUsdValue(
              { amount: collateralChange, amountUsd: collateralChangeUsd, timestamp },
              currentTime,
            ),
          ),
        })}
        icon={{ blockchainId, token: collateralToken }}
      />
      <MetricExpandedPanel
        label={notFalsy(t`Debt`, borrowToken?.symbol && `(${borrowToken.symbol})`).join(' ')}
        value={hasLoanChange ? loanChange : null}
        valueOptions={{ signDisplay: 'exceptZero', color: getChangeColor(loanChange, 'error', 'success') }}
        {...(hasLoanChange && {
          notional: constQ(
            formatActivityUsdValue({ amount: loanChange, amountUsd: loanChangeUsd, timestamp }, currentTime),
          ),
        })}
        icon={{ blockchainId, token: borrowToken }}
      />
    </MetricsGrid>
  )
}
