import { combineActionInfoState } from '@/llamalend/widgets/action-card/info-actions.helpers'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { q } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { useScrvUsdExchangeRate } from '../../entities/scrvusd-exchange-rate.query'
import type { ChainId } from '../../types/loan.types'

export function ScrvUsdExchangeRateActionInfo({
  chainId,
  enabled,
}: {
  chainId: ChainId | null | undefined
  enabled: boolean
}) {
  const exchangeRate = useScrvUsdExchangeRate({ chainId }, enabled)
  return (
    <ActionInfo
      label={t`Exchange rate`}
      value={
        exchangeRate.data &&
        t`1 crvUSD = ${formatNumber(exchangeRate.data, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
          abbreviate: false,
        })} scrvUSD`
      }
      {...combineActionInfoState(q(exchangeRate))}
      size="small"
      testId="scrvusd-deposit-exchange-rate"
    />
  )
}
