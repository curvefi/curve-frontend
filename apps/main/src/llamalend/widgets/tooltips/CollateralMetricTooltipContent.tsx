import { formatPercentage } from '@/llamalend/widgets/tooltips/tooltip.utils'
import { t } from '@evm-ui/lib/i18n'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@evm-ui/shared/ui/TooltipComponents'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { formatNumber, formatToken } from '@evm-ui/utils'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui/features/queries/util'

type TokenValues = {
  value: Decimal | undefined | null
  symbol: string | undefined
  conversionRate?: Decimal | number | null
}

type CollateralMetricTooltipContentProps = {
  totalValue: Decimal | undefined | null
  totalValueUsd: QueryProp<Decimal>
  collateral: TokenValues
  borrow: TokenValues
}

export const CollateralMetricTooltipContent = ({
  collateral,
  borrow,
  totalValue,
  totalValueUsd: { data: totalValueUsd, isLoading: isTotalValueUsdLoading },
}: CollateralMetricTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription
      text={[
        t`Collateral value is taken by multiplying tokens in collateral by the oracle price.`,
        t`In soft liquidation, it may include ${borrow?.symbol ?? 'borrow tokens'} due to liquidation protection.`,
      ].join(' ')}
    />

    <Stack>
      <TooltipItems secondary>
        <TooltipItem title={t`Deposit token`} variant="independent">
          {formatToken(collateral?.value, collateral?.symbol)}
          {formatPercentage(collateral?.value, totalValue, collateral?.conversionRate)}
        </TooltipItem>
        <TooltipItem title={t`Borrow token`} variant="independent">
          {formatToken(borrow?.value, borrow?.symbol)}
          {formatPercentage(borrow?.value, totalValue, borrow?.conversionRate)}
        </TooltipItem>
      </TooltipItems>
    </Stack>
    <Stack>
      <TooltipItem title={t`Total collateral value`} variant="independent">
        {formatToken(totalValue, borrow.symbol, 'amount')}
        <WithSkeleton loading={isTotalValueUsdLoading} width="3rem">
          {formatNumber(totalValueUsd, 'usd.amount')}
        </WithSkeleton>
      </TooltipItem>
    </Stack>
  </TooltipWrapper>
)
