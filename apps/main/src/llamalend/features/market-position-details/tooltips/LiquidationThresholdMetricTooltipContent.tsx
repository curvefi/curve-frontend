import {
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
  TooltipDescription,
} from '@/llamalend/widgets/tooltips/TooltipComponents'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import type { BandRange, LiquidationRange } from '../BorrowPositionDetails'

type LiquidationThresholdTooltipContentProps = {
  liquidationRange: LiquidationRange | undefined | null
  rangeToLiquidation: number | undefined | null
  bandRange: BandRange | undefined | null
}

const UnavailableNotation = '-'

export const LiquidationThresholdTooltipContent = ({
  liquidationRange,
  rangeToLiquidation,
  bandRange,
}: LiquidationThresholdTooltipContentProps) => (
  <TooltipWrapper>
    <TooltipDescription
      text={t`The price at which your position enters the liquidation zone  and your collateral starts to be eroded by LLAMMA. The distance to LT indicates the distance between the current price and the LT.`}
    />
    <TooltipItems secondary>
      <TooltipItem title={t`Distance to LT`} variant="independent">
        {rangeToLiquidation ? formatNumber(rangeToLiquidation, { ...FORMAT_OPTIONS.PERCENT }) : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Liquidation zone`} variant="independent">
        {liquidationRange?.value
          ? `${formatNumber(liquidationRange.value[0], { ...FORMAT_OPTIONS.USD })} to ${formatNumber(liquidationRange.value[1], { ...FORMAT_OPTIONS.USD })}`
          : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Amount of bands`} variant="independent">
        {bandRange?.value ? formatNumber(Math.abs(bandRange.value[0] - bandRange.value[1])) : UnavailableNotation}
      </TooltipItem>
      <TooltipItem title={t`Band range`} variant="independent">
        {bandRange?.value ? `${bandRange.value[0]} to ${bandRange.value[1]}` : UnavailableNotation}
      </TooltipItem>
    </TooltipItems>
  </TooltipWrapper>
)
