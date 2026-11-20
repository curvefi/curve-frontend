import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import { evmAddressDisplay } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import { formatDate } from '@primitives/date.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { Subscribe } from '@tanstack/react-table'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { AddressActionInfo } from '@ui/features/forms/action-info/AddressActionInfo'
import { constQ } from '@ui/features/queries/util'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t } from '@ui/lib/i18n'
import { ActivityColumnId } from './columns/columns.enum'
import { ACTIVITY_TITLES } from './columns/columns.titles'
import type { ActivityRow } from './types'
import { formatActivityUsdValue, getActivityDeltaKey, getChangeColor, getTransactionActions } from './utils'

export const ActivityExpandedPanel: ExpandedPanelComponent<ActivityRow> = ({
  row: {
    original: { chainId, blockchainId, deltas, timestamp, valueUsd, address, txHash },
  },
  table,
}) => {
  const currentDate = useCurrentDate()

  return (
    <Stack>
      <ActionInfo label={ACTIVITY_TITLES[ActivityColumnId.Time]} value={formatDate(timestamp, 'long')} />
      <AddressActionInfo
        chainId={chainId}
        title={ACTIVITY_TITLES[ActivityColumnId.Address]}
        address={address}
        display={evmAddressDisplay}
      />
      <Subscribe
        source={table.atoms.columnVisibility}
        selector={() => table.getColumn(ActivityColumnId.Value)?.getIsVisible()}
      >
        {showValue =>
          showValue && (
            <ActionInfo
              label={t`Value`}
              value={formatActivityUsdValue(
                { amount: deltas[0]?.amount ?? 0, amountUsd: valueUsd, timestamp },
                currentDate,
                'usd.amount',
              )}
            />
          )
        }
      </Subscribe>
      {deltas.length ? (
        <MetricsGrid variant="mobileRows">
          {deltas.map(({ label, token, amount, amountColor, amountUsd }, index) => (
            <MetricExpandedPanel
              key={getActivityDeltaKey(label, token?.address, index)}
              label={token?.symbol && token.symbol !== label ? `${label} (${token.symbol})` : label}
              value={amount}
              valueOptions={{
                formatter: value => formatNumber(value, 'token.delta'),
                color: amountColor ?? getChangeColor(amount, 'success', 'error'),
              }}
              // Skip undefined only so the formatter can show Processing for null prices.
              notional={
                (amountUsd !== undefined &&
                  constQ(formatActivityUsdValue({ amount, amountUsd, timestamp }, currentDate, 'usd.amount'))) ||
                undefined
              }
              icon={{ blockchainId, token }}
            />
          ))}
        </MetricsGrid>
      ) : (
        <ActionInfo label={t`Amount`} value={UNAVAILABLE_NOTATION} />
      )}
      <ExpandedPanelActions actions={getTransactionActions(chainId, txHash)} />
    </Stack>
  )
}
