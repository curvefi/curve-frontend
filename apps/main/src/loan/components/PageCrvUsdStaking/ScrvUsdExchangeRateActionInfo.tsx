import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { mapQuery } from '@ui-kit/types/util'
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
      value={mapQuery(exchangeRate, data =>
        [1, 'crvUSD', '=', formatNumber(data, 'token.amount'), 'scrvUSD'].join(' '),
      )}
      size="small"
      testId="scrvusd-deposit-exchange-rate"
    />
  )
}
