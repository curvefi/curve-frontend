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
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
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
