import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { useUserProfileStore } from '@ui/features/user-profile'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

export const SwapInfoList = ({
  exchangeRate,
  minimum,
  priceImpact,
  gas,
  fromSymbol,
  toSymbol,
  slippage,
  userAddress,
}: {
  exchangeRate: QueryProp<Decimal>
  minimum: QueryProp<Decimal>
  priceImpact: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo>
  fromSymbol: string | undefined
  toSymbol: string | undefined
  slippage: Decimal
  userAddress: Address | undefined
}) => (
  <Stack>
    <ActionInfo
      label={t`Exchange rate`}
      testId="pool-swap-exchange-rate"
      value={mapQuery(exchangeRate, exchangeRate =>
        [formatToken(1, fromSymbol), formatToken(exchangeRate, toSymbol, 'balance')].join(' = '),
      )}
      size="small"
    />
    <ActionInfo
      label={t`Minimum received`}
      testId="pool-swap-minimum-received"
      value={mapQuery(minimum, value => `${formatNumber(value, 'token.balance')} ${toSymbol ?? ''}`)}
      size="small"
    />
    <PriceImpactActionInfo
      priceImpact={priceImpact}
      value={mapQuery(priceImpact, value => formatNumber(value, 'percent.price-impact'))}
      size="small"
    />
    <SlippageToleranceActionInfo
      maxSlippage={slippage}
      onChanged={useUserProfileStore(state => state.setMaxSlippage)}
      type="stable"
      userAddress={userAddress}
      size="small"
    />
    <ActionInfoGasEstimate gas={gas} />
  </Stack>
)
