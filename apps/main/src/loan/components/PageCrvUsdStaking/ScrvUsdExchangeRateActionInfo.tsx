import { formatNumber } from '@primitives/number.utils'
import type { Nullish } from '@primitives/objects.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useScrvUsdExchangeRate } from '../../entities/scrvusd-exchange-rate.query'
import type { ChainId } from '../../types/loan.types'

export function ScrvUsdExchangeRateActionInfo({ chainId, enabled }: { chainId: ChainId | Nullish; enabled: boolean }) {
  const exchangeRate = useScrvUsdExchangeRate({ chainId }, enabled)
  return (
    <ActionInfo
      label={t`Exchange rate`}
      value={mapQuery(exchangeRate, data =>
        [1, 'crvUSD', '=', formatNumber(data, 'token.amount'), 'scrvUSD'].join(' '),
      )}
      size="small"
      testId="scrvusd-deposit-exchange-rate"
    />
  )
}
