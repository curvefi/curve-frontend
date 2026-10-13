import { getAddressOrPair } from '@/llamalend/llama.utils'
import { formatActivityUsdValue, getChangeColor } from '@evm-ui/features/activity-table/utils'
import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import { BlockchainIds } from '@evm-ui/utils/network'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { constQ } from '@ui/features/queries/util'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import type { ParsedUserCollateralEvent } from './hooks/useUserCollateralEvents'

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
  const currentDate = useCurrentDate()
  const blockchainId = BlockchainIds[chainId]

  return (
    <MetricsGrid variant="mobileRows">
      <MetricExpandedPanel
        label={notFalsy(t`Collateral`, collateralToken?.symbol && `(${collateralToken.symbol})`).join(' ')}
        value={collateralChange || null}
        valueOptions={{
          formatter: value => formatNumber(value, 'token.delta'),
          color: getChangeColor(collateralChange, 'success', 'error'),
        }}
        {...(!!collateralChange && {
          notional: constQ(
            formatActivityUsdValue(
              { amount: collateralChange, amountUsd: collateralChangeUsd, timestamp },
              currentDate,
            ),
          ),
        })}
        icon={{ blockchainId, token: { address: getAddressOrPair(blockchainId, collateralToken?.address) } }}
      />
      <MetricExpandedPanel
        label={notFalsy(t`Debt`, borrowToken?.symbol && `(${borrowToken.symbol})`).join(' ')}
        value={loanChange || null}
        valueOptions={{
          formatter: value => formatNumber(value, 'token.delta'),
          color: getChangeColor(loanChange, 'error', 'success'),
        }}
        {...(!!loanChange && {
          notional: constQ(
            formatActivityUsdValue({ amount: loanChange, amountUsd: loanChangeUsd, timestamp }, currentDate),
          ),
        })}
        icon={{ blockchainId, token: { address: getAddressOrPair(blockchainId, borrowToken?.address) } }}
      />
    </MetricsGrid>
  )
}
