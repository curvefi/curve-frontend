import { formatPercentage } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { QueryProp } from '@ui-kit/types/util'
import { formatNumber, formatToken } from '@ui-kit/utils'

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
}: CollateralMetricTooltipContentProps) => {
  const collateralPercentage = formatPercentage(collateral?.value, totalValue, collateral?.conversionRate)
  const borrowPercentage = formatPercentage(borrow?.value, totalValue, borrow?.conversionRate)
  return (
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
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {formatToken(borrow?.value, borrow?.symbol)}
            {borrowPercentage && ` (${borrowPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>
      <Stack>
        <TooltipItem title={t`Total collateral value`} variant="independent">
          {formatToken(totalValue, borrow.symbol, 'amount')}
        </TooltipItem>
        <TooltipItem title={t`Total collateral USD value`} loading={isTotalValueUsdLoading} variant="independent">
          {formatNumber(totalValueUsd, 'usd.amount')}
        </TooltipItem>
      </Stack>
    </TooltipWrapper>
  )
}
