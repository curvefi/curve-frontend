import { combineActionInfoState } from '@/llamalend/widgets/action-card/info-actions.helpers'
import { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

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
        valueTooltip={first && `${formatNumber(first.value, { abbreviate: false })} ${first.symbol}`}
        value={first == null ? '-' : formatNumber(first.value, { abbreviate: true })}
        valueRight={first?.symbol}
        size="small"
        testId="return-to-wallet"
        {...combineActionInfoState(returnToWallet)}
      />
      {second && (
        <ActionInfo
          label={''}
          valueTooltip={`${formatNumber(second.value, { abbreviate: false })} ${second.symbol}`}
          value={second ? formatNumber(second.value, { abbreviate: true }) : '-'}
          valueRight={second.symbol}
          size="small"
          testId="return-to-wallet"
        />
      )}
    </>
  )
}
