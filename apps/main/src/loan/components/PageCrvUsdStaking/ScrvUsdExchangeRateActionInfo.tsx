import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { mapQuery } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
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
