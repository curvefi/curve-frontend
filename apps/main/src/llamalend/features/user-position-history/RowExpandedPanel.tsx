import { formatActivityUsdValue } from '@evm-ui/features/activity-table/utils'
import { BlockchainIds } from '@evm-ui/utils/network'
import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { TokenIcon } from '@ui/components/TokenIcon'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

const EXPANDED_METRIC_CATEGORY = 'llamalend.marketParticipantsExpanded'
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
      <Metric
        category={EXPANDED_METRIC_CATEGORY}
        label={notFalsy(t`Collateral`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
        value={hasCollateralChange ? collateralChange : null}
        valueOptions={{
          abbreviate: false,
          fallback: UNAVAILABLE_NOTATION,
          signDisplay: 'exceptZero',
          color: getChangeColor(collateralChange, 'success', 'error'),
        }}
        {...(hasCollateralChange && {
          notional: constQ(
            formatActivityUsdValue(
              { amount: collateralChange, amountUsd: collateralChangeUsd, timestamp },
              currentTime,
            ),
          ),
        })}
        icon={
          collateralToken && <TokenIcon blockchainId={blockchainId} address={collateralToken.address} size="mui-sm" />
        }
      />
      <Metric
        category={EXPANDED_METRIC_CATEGORY}
        label={notFalsy(t`Debt`, borrowToken?.symbol && `(${borrowToken.symbol})`).join(' ')}
        value={hasLoanChange ? loanChange : null}
        valueOptions={{
          abbreviate: false,
          fallback: UNAVAILABLE_NOTATION,
          signDisplay: 'exceptZero',
          color: getChangeColor(loanChange, 'error', 'success'),
        }}
        {...(hasLoanChange && {
          notional: constQ(
            formatActivityUsdValue({ amount: loanChange, amountUsd: loanChangeUsd, timestamp }, currentTime),
          ),
        })}
        icon={borrowToken && <TokenIcon blockchainId={blockchainId} address={borrowToken.address} size="mui-sm" />}
      />
    </MetricsGrid>
  )
}
