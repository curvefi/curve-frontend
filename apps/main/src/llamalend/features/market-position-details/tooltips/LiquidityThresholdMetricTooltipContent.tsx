import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import type { BandRange, LiquidationRange } from '../BorrowPositionDetails'

type LiquidityThresholdTooltipContentProps = {
  liquidationRange: LiquidationRange | undefined | null
  rangeToLiquidation: number | undefined | null
  bandRange: BandRange | undefined | null
}

const UnavailableNotation = '-'

export const LiquidityThresholdTooltipContent = ({
  liquidationRange,
  rangeToLiquidation,
  bandRange,
}: LiquidityThresholdTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The price at which your position enters the liquidation zone  and your collateral starts to be eroded by LLAMMA. The distance to LT indicates the distance between the current price and the LT.`}
    />
    <TooltipItems secondary>
      <TooltipItem title={t`Distance to LT`} variant="independent">
        {rangeToLiquidation ? formatNumber(rangeToLiquidation, { ...FORMAT_OPTIONS.PERCENT }) : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Liquidation threshold`} variant="independent">
        {liquidationRange?.value?.[1]
          ? formatNumber(liquidationRange.value[1], { ...FORMAT_OPTIONS.USD })
          : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Liquidation lower bound`} variant="independent">
        {liquidationRange?.value?.[0]
          ? formatNumber(liquidationRange.value[0], { ...FORMAT_OPTIONS.USD })
          : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Band range`} variant="independent">
        {bandRange?.value ? `${bandRange.value[0]} to ${bandRange.value[1]}` : UnavailableNotation}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
