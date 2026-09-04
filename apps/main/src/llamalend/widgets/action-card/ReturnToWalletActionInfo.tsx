import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { formatNumber, formatToken } from '@evm-ui/utils'
import { Decimal } from '@primitives/decimal.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export function ReturnToWalletActionInfo({
  returnToWallet,
}: {
  returnToWallet: QueryProp<{ value: Decimal; symbol: string }[]>
}) {
  const [first, second] = returnToWallet.data ?? []
  return (
    <>
      <ActionInfo
        label={t`Return to wallet`}
        valueTooltip={first && formatToken(first.value, first.symbol, 'amount')}
        value={mapQuery(returnToWallet, ([first]) => formatNumber(first?.value, { abbreviate: true, fallback: '-' }))}
        valueRight={first?.symbol}
        size="small"
        testId="return-to-wallet"
      />
      {second && (
        <ActionInfo
          label=""
          valueTooltip={formatToken(second.value, second.symbol, 'amount')}
          value={second ? formatNumber(second.value, { abbreviate: true }) : '-'}
          valueRight={second.symbol}
          size="small"
          testId="return-to-wallet"
        />
      )}
    </>
  )
}
