import {
  formatMetricValue,
  formatPercentage,
  UNAVAILABLE_NOTATION,
  UNAVAILABLE_TOKEN_SYMBOL,
} from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { formatNumber } from '@ui-kit/utils'

type TokenValues = {
  value: Decimal | undefined | null
  symbol: string | undefined
  conversionRate?: Decimal | number | null
}

type CollateralMetricTooltipContentProps = {
  totalValue: Decimal | undefined | null
  collateral: TokenValues
  borrow: TokenValues
}

export const CollateralMetricTooltipContent = ({
  collateral,
  borrow,
  totalValue,
}: CollateralMetricTooltipContentProps) => {
  const collateralPercentage = formatPercentage(collateral?.value, totalValue, collateral?.conversionRate ?? 1)
  const borrowPercentage = formatPercentage(borrow?.value, totalValue, borrow?.conversionRate ?? 1)
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
            {`${formatMetricValue(collateral?.value)} ${collateral?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}`}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {`${formatMetricValue(borrow?.value)} ${borrow?.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}`}
            {borrowPercentage && ` (${borrowPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValue == null
          ? UNAVAILABLE_NOTATION
          : `${formatNumber(totalValue, 'token.amount')} ${borrow.symbol ?? UNAVAILABLE_TOKEN_SYMBOL}`}
      </TooltipItem>
    </TooltipWrapper>
  )
}
