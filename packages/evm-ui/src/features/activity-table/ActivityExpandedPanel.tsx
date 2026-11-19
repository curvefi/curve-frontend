import { MetricExpandedPanel } from '@evm-ui/shared/ui/MetricExpandedPanel'
import { evmAddressDisplay } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import { formatDate } from '@primitives/date.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { Subscribe } from '@tanstack/react-table'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { AddressActionInfo } from '@ui/features/forms/action-info/AddressActionInfo'
import { constQ } from '@ui/features/queries/util'
import { ExpandedPanelActions } from '@ui/features/tables/ExpandedPanelActions'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { t } from '@ui/lib/i18n'
import { ActivityColumnId } from './columns/columns.enum'
import { ACTIVITY_TITLES } from './columns/columns.titles'
import type { ActivityRow } from './types'
import { getChangeColor, getTransactionActions } from './utils'

export const ActivityExpandedPanel: ExpandedPanelComponent<ActivityRow> = ({
  row: {
    original: { chainId, blockchainId, deltas, timestamp, valueUsd, address, txHash },
  },
  table,
}) => (
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
      {isVisible => isVisible && <ActionInfo label={t`Value`} value={formatNumber(valueUsd, 'usd.amount')} />}
    </Subscribe>
    {deltas.length ? (
      <MetricsGrid variant="mobileRows">
        {deltas.map(({ label, token, amount, amountUsd }) => (
          <MetricExpandedPanel
            key={label}
            label={token?.symbol ? `${label} (${token.symbol})` : label}
            value={amount}
            valueOptions={{
              formatter: value => formatNumber(value, 'token.delta'),
              color: getChangeColor(amount, 'success', 'error'),
            }}
            notional={maybe(amountUsd, amountUsd => constQ(formatNumber(amountUsd, 'usd.amount')))}
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
