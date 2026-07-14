import { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatNumber, formatTokenAmount } from '@ui-kit/utils'

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
        valueTooltip={first && formatTokenAmount(first.value, first.symbol)}
        value={mapQuery(returnToWallet, ([first]) => formatNumber(first?.value, { abbreviate: true, fallback: '-' }))}
        valueRight={first?.symbol}
        size="small"
        testId="return-to-wallet"
      />
      {second && (
        <ActionInfo
          label=""
          valueTooltip={formatTokenAmount(second.value, second.symbol)}
          value={second ? formatNumber(second.value, { abbreviate: true }) : '-'}
          valueRight={second.symbol}
          size="small"
          testId="return-to-wallet"
        />
      )}
    </>
  )
}
