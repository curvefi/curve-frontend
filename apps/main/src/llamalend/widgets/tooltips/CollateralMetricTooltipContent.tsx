import { formatMetricValue, formatPercentage, UnavailableNotation } from '@/llamalend/widgets/tooltips/tooltip.utils'
import {
  TooltipDescription,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { Stack } from '@mui/material'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { formatUsd } from '@ui-kit/utils'

type TokenValues = {
  value: Decimal | undefined | null
  usdRate: number | undefined | null
  symbol: string | undefined
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
  const collateralPercentage = formatPercentage(collateral?.value, totalValue, collateral?.usdRate)
  const borrowPercentage = formatPercentage(borrow?.value, totalValue, borrow?.usdRate)
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
            {`${formatMetricValue(collateral?.value)} ${collateral?.symbol ?? '?'}`}
            {collateralPercentage && ` (${collateralPercentage})`}
          </TooltipItem>
          <TooltipItem title={t`Borrow token`} variant="independent">
            {`${formatMetricValue(borrow?.value)} ${borrow?.symbol ?? '?'}`}
            {borrowPercentage && ` (${borrowPercentage})`}
          </TooltipItem>
        </TooltipItems>
      </Stack>

      <TooltipItem title={t`Total collateral value`} variant="independent">
        {totalValue == null ? UnavailableNotation : formatUsd(totalValue, { abbreviate: false })}
      </TooltipItem>
    </TooltipWrapper>
  )
}
