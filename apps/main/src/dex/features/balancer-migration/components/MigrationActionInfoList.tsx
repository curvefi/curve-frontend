import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { LP_DECIMALS } from '../queries/migration-route.query'

/** Raw Curve LP amounts, as both quote sources return them. */
export type MigrationQuote = { amountOut: Decimal; minAmountOut: Decimal; routerFeePercentage: Decimal }

type MigrationActionInfoListProps = {
  quote: QueryProp<MigrationQuote>
  priceImpact: QueryProp<Decimal | null>
  gas: Parameters<typeof PoolActionInfoList>[0]['gas']
  slippage: Decimal
  onSlippageChange: (slippage: Decimal) => void
  userAddress: Address | undefined
}

export const MigrationActionInfoList = ({
  quote,
  priceImpact,
  gas,
  slippage,
  onSlippageChange,
  userAddress,
}: MigrationActionInfoListProps) => (
  <>
    <PoolActionInfoList
      expectedLp={mapQuery(quote, ({ amountOut }) => fromWei(amountOut, LP_DECIMALS))}
      expectedLpLabel={t`Expected LP received`}
      expectedLpTestId="migration-expected-lp"
      minimumLp={mapQuery(quote, ({ minAmountOut }) => fromWei(minAmountOut, LP_DECIMALS))}
      priceImpact={priceImpact}
      gas={gas}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      userAddress={userAddress}
      slippageType="crypto"
    />
    <ActionInfo
      testId="migration-fee"
      label={t`Router fee`}
      value={mapQuery(quote, ({ routerFeePercentage }) => formatNumber(routerFeePercentage, 'percent.value'))}
      size="small"
    />
  </>
)
