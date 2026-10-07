import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import type { UseFormReturn } from '@ui/features/forms'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { fromWei } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { MigrationRoute } from '../api/migration-route.api'
import type { MigrationForm, MigrationParams } from '../migration.validation'
import { LP_DECIMALS, useMigrationEstimateGas } from '../queries/migration-route.query'

type MigrationActionInfoListProps = {
  form: UseFormReturn<MigrationForm>
  params: MigrationParams
  route: QueryProp<MigrationRoute>
  priceImpact: QueryProp<{ priceImpact: Decimal | undefined; tokenInUsd: Decimal | undefined } | undefined>
  userAddress: Address | undefined
}

export const MigrationActionInfoList = ({
  form,
  params,
  route,
  priceImpact,
  userAddress,
}: MigrationActionInfoListProps) => (
  <>
    <PoolActionInfoList
      expectedLp={mapQuery(route, ({ amountOut: [amountOut] }) => fromWei(amountOut, LP_DECIMALS))}
      expectedLpLabel={t`Expected LP received`}
      expectedLpTestId="balancer-migration-expected-lp"
      minimumLp={mapQuery(route, ({ minAmountOut }) => fromWei(minAmountOut, LP_DECIMALS))}
      priceImpact={mapQuery(priceImpact, impact => impact?.priceImpact ?? null)}
      gas={useMigrationEstimateGas(params)}
      slippage={form.watchValue('slippage')}
      onSlippageChange={slippage => form.update({ slippage })}
      userAddress={userAddress}
      slippageType="crypto"
    />
    <ActionInfo
      testId="balancer-migration-fee"
      label={t`Router fee`}
      value={mapQuery(route, ({ routerFeePercentage }) => formatNumber(routerFeePercentage, 'percent.value'))}
      size="small"
    />
  </>
)
